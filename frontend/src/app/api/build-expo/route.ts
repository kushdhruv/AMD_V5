import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { transformToExpoConfig } from "@/lib/app-builder-v2/schema/configTransformer";

export async function POST(req: Request) {
  try {
    const { config, appId } = await req.json();

    if (!config || !appId) {
      return NextResponse.json({ success: false, error: "Missing config or appId" }, { status: 400 });
    }

    // 1. Verify User Session
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: "Session expired. Please log out and log back in." }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ success: false, error: "User not found or session invalid." }, { status: 401 });
    }

    // 2. Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', appId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ success: false, error: "Project not found or access denied" }, { status: 404 });
    }

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ success: false, error: "GITHUB_TOKEN is not set" }, { status: 500 });
    }

    // 3. If the logo is a base64 data URI, upload it to Supabase Storage first
    //    so the GitHub Actions payload stays under the ~65 KB limit.
    let buildConfig = { ...config, event: { ...config.event } };
    const logoUrl: string = buildConfig.event.logo_url || '';

    if (logoUrl.startsWith('data:image/')) {
      try {
        const matches = logoUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const ext = mimeType.split('/')[1] || 'png';
          const filePath = `icons/${appId}.${ext}`;
          const buffer = Buffer.from(base64Data, 'base64');
          const blob = new Blob([buffer], { type: mimeType });
          
          const { error: uploadError } = await supabase.storage
            .from('app_assets')
            .upload(filePath, blob, { contentType: mimeType, upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('app_assets').getPublicUrl(filePath);
            buildConfig.event.logo_url = urlData.publicUrl;
            console.log(`[Build] Icon uploaded → ${urlData.publicUrl}`);
          } else {
            console.warn('[Build] Icon upload failed:', uploadError.message);
            buildConfig.event.logo_url = '';
          }
        }
      } catch (iconErr: any) {
        console.warn('[Build] Icon error, continuing without logo:', iconErr.message);
        buildConfig.event.logo_url = '';
      }
    }

    // 4. Transform web AppConfig → ExpoAppConfig
    const expoConfig = transformToExpoConfig(buildConfig, appId);
    const configBase64 = Buffer.from(JSON.stringify(expoConfig, null, 2)).toString("base64");

    console.log(`[Build] Dispatching EAS build for App ID: ${appId} (${expoConfig.event.name})`);

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = "kushdhruv";
    const repo = "AMD_V5";

    // 4. Trigger GitHub Actions workflow
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: "eas-build.yml",
      ref: "main",
      inputs: {
        app_config_base64: configBase64,
        app_id: appId,
        build_profile: "preview",
        platform: "android",
      },
    });

    const actionsUrl = `https://github.com/${owner}/${repo}/actions`;

    return NextResponse.json({ 
      success: true, 
      actionsUrl,
      message: `EAS Build triggered for "${expoConfig.event.name}" (${appId})`
    });

  } catch (error: any) {
    console.error("[Build] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
