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

    const { error } = await supabaseAdmin
      .from("projects")
      .update({
        status: status.toLowerCase(), // 'success', 'failed', 'building'
        blueprint_json: {
          // Flatten existing blueprint and add build info
          apk_url: apkUrl,
          build_id: buildId,
          last_build_at: new Date().toISOString()
        }
      })
      .eq("id", appId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Project status updated" });

  } catch (error: any) {
    console.error("Build Status Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
