import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client needed to bypass RLS for build updates from CI
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { appId, status, apkUrl, buildId } = await req.json();

    if (!appId || !status) {
      return NextResponse.json({ success: false, error: "Missing appId or status" }, { status: 400 });
    }

    console.log(`[Build Status] Updating app ${appId} to status: ${status}`);

    // 1. Fetch existing project to prevent overwriting blueprint_json
    const { data: project, error: fetchError } = await supabaseAdmin
      .from("projects")
      .select("blueprint_json")
      .eq("id", appId)
      .single();

    if (fetchError || !project) {
      console.error("[Build Status] Project not found:", appId);
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // 2. Merge build info into existing blueprint
    const updatedBlueprint = {
      ...(project.blueprint_json as object || {}),
      apk_url: apkUrl,
      build_id: buildId,
      last_build_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from("projects")
      .update({
        status: status.toLowerCase(), // 'success', 'failed', 'building'
        blueprint_json: updatedBlueprint
      })
      .eq("id", appId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Project status updated" });

  } catch (error: any) {
    console.error("Build Status Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
