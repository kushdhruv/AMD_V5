import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  try {
    const { config, appId } = await req.json();

    if (!config || !appId) {
      return NextResponse.json({ success: false, error: "Missing config or appId" }, { status: 400 });
    }

    // 1. Verify User Ownership
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    
    // Use getSession() + getUser() for more robust auth checking in API routes
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: "Session expired. Please log out and log back in." }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ success: false, error: "User not found or session invalid." }, { status: 401 });
    }

    // Check if user owns the project
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

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // 1. Get Repo Details (Found via git remote)
    const owner = "kushdhruv";
    const repo = "AMD_V5";

    // 2. Encode Config to Base64
    const configBase64 = Buffer.from(JSON.stringify(config)).toString("base64");

    // 4. Trigger workflow_dispatch
    console.log(`[GitHub API] Dispatching eas-build.yml for app: ${appId}`);
    
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: "eas-build.yml",
      ref: "main", // or current branch
      inputs: {
        app_config_base64: configBase64,
        app_id: appId,
        build_profile: "preview", // default
        platform: "android", // default
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });

    // 4. Return the actions URL for the user to monitor
    const actionsUrl = `https://github.com/${owner}/${repo}/actions`;

    return NextResponse.json({ 
      success: true, 
      actionsUrl,
      message: "EAS Build Triggered via GitHub Actions"
    });

  } catch (error: any) {
    console.error("Build Expo Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
