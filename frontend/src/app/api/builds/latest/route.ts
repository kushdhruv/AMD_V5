import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appFullName = searchParams.get("appId"); // e.g., @dhruvqwerty/expo-template

    if (!appFullName) {
      return NextResponse.json({ success: false, error: "Missing appId (e.g., @owner/slug)" }, { status: 400 });
    }

    const EXPO_TOKEN = process.env.EXPO_TOKEN;
    if (!EXPO_TOKEN) {
      return NextResponse.json({ success: false, error: "EXPO_TOKEN not configured on server" }, { status: 500 });
    }

    console.log(`[EAS GraphQL] Fetching latest build for: ${appFullName}`);

    const query = `
      query GetBuilds($appId: String!) {
        app {
          byFullName(fullName: $appId) {
            builds(platform: ANDROID, limit: 1, offset: 0) {
              id
              status
              artifacts {
                buildUrl
              }
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.expo.dev/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EXPO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { appId: appFullName }
      }),
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EAS GraphQL] Error: ${response.status} - ${errorText}`);
      return NextResponse.json({ success: false, error: "Failed to fetch from Expo GraphQL API" }, { status: response.status });
    }

    const data = await response.json();
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error(`[EAS GraphQL] Errors:`, JSON.stringify(data.errors));
      return NextResponse.json({ success: false, error: data.errors[0].message }, { status: 400 });
    }

    const build = data?.data?.app?.byFullName?.builds?.[0];

    if (!build) {
      return NextResponse.json({ success: false, error: "No builds found for this project" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      buildId: build.id,
      status: build.status,
      apkUrl: build.artifacts?.buildUrl || null,
      createdAt: build.createdAt,
      updatedAt: build.updatedAt
    });

  } catch (error: any) {
    console.error("Latest Build Fetch GraphQL Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
