
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const formData = await request.json();

    if (!projectId) {
      return Response.json({ error: "Project ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Basic validation
    if (!formData.email || !formData.name) {
       // Allow flexible schema, but warn if empty
    }

    const { data, error } = await supabase
      .from("registrations")
      .insert({
        project_id: projectId,
        email: formData.email,
        name: formData.name,
        form_data: formData, // Store full JSON for flexible fields
      })
      .select();

    if (error) throw error;

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "Registration failed: " + error.message },
      { status: 500 }
    );
  }
}
