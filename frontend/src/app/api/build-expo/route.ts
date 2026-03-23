import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  try {
    const { config, appId } = await req.json();

    if (!config || !appId) {
      return NextResponse.json({ success: false, error: "Missing config or appId" }, { status: 400 });
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

    // 3. Trigger workflow_dispatch
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
