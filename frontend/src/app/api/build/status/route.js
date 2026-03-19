
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

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!res.ok) throw new Error("Failed to fetch run status");
        const data = await res.json();

        return NextResponse.json({
            status: data.status,
            conclusion: data.conclusion,
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
