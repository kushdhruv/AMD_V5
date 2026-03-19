import { NextResponse } from "next/server";
import { validateAppConfig } from "@/lib/app-builder-v2/schema/validator";

export async function POST(req: Request) {
  try {
    const rawConfig = await req.json();
    const result = validateAppConfig(rawConfig);
    
    if (!result.isValid) {
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, config: result.parsedConfig });
  } catch (error) {
    return NextResponse.json({ success: false, errors: ["Invalid JSON payload"] }, { status: 400 });
  }
}
