
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const artifactId = searchParams.get("artifactId");

  if (!owner || !repo || !artifactId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN missing" }, { status: 500 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const { url } = await octokit.actions.downloadArtifact({
      owner,
      repo,
      artifact_id: artifactId,
      archive_format: "zip",
    });

    // Redirect to the signed URL
    return NextResponse.redirect(url);

  } catch (error) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
