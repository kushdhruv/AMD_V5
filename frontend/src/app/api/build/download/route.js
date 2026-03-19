
import { NextResponse } from 'next/server';
import { exec } from 'child_process';

const REPO_ROOT = process.cwd();

function runCommand(cmd, cwd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd }, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout);
        });
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const runId = searchParams.get('runId');

        if (!runId) return NextResponse.json({ error: "Missing runId" }, { status: 400 });

        // Get Repo Info
        const remoteUrl = await runCommand('git remote get-url origin', REPO_ROOT);
        const match = remoteUrl.match(/github\.com[:\/]([^\/]+)\/([^\.]+)/);
        if (!match) return NextResponse.json({ error: "Invalid remote" }, { status: 500 });
        
        const owner = match[1];
        const repo = match[2];

        if (!process.env.GITHUB_TOKEN) {
             return NextResponse.json({ error: "Missing GITHUB_TOKEN" }, { status: 500 });
        }

        // 1. List Artifacts
        const artifactsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const artifactsData = await artifactsRes.json();
        
        // Find 'app-release-apk' or take the first one
        const artifact = artifactsData.artifacts?.find(a => a.name === 'app-release-apk') || artifactsData.artifacts?.[0];

        if (!artifact) {
            return NextResponse.json({ error: "No artifacts found yet" }, { status: 404 });
        }

        // 2. Get Download URL (This returns a 302 Redirect to Blob Storage)
        // We fetch with redirect: 'manual' to get the Location header
        const downloadRes = await fetch(artifact.archive_download_url, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            },
            redirect: 'manual'
        });

        if (downloadRes.status === 302 || downloadRes.status === 301) {
            const blobUrl = downloadRes.headers.get('location');
            if (blobUrl) {
                // Redirect user to the signed blob URL
                return NextResponse.redirect(blobUrl);
            }
        }
        
        // If it didn't redirect (maybe fetched content directly?), stream it?
        // Usually GitHub API redirects. If not, we might be blocked.
        return NextResponse.json({ error: "Could not retrieve download URL" }, { status: 500 });

    } catch (error) {
        console.error("Download Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
