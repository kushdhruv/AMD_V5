
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN missing" }, { status: 500 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // 1. Get latest run
    const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 1,
    });

    if (runs.workflow_runs.length === 0) {
      return NextResponse.json({ status: "pending", message: "No runs found" });
    }

    const run = runs.workflow_runs[0];

    // 2. Check Status
    if (run.status === "completed") {
      if (run.conclusion === "success") {
        
        // 3. Get Artifacts
        const { data: artifacts } = await octokit.actions.listWorkflowRunArtifacts({
          owner,
          repo,
          run_id: run.id,
        });

        const apkArtifact = artifacts.artifacts.find(a => a.name === "app-release" || a.name.includes("apk"));

        if (apkArtifact) {
           return NextResponse.json({ 
               status: "completed", 
               conclusion: "success", 
               artifactId: apkArtifact.id,
               downloadUrl: `/api/download-artifact?owner=${owner}&repo=${repo}&artifactId=${apkArtifact.id}`
           });
        } else {
           return NextResponse.json({ status: "completed", conclusion: "success", error: "Artifact not found" });
        }

      } else {
        return NextResponse.json({ status: "completed", conclusion: run.conclusion }); // connection failure, etc
      }
    }

    return NextResponse.json({ status: run.status });

  } catch (error) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
