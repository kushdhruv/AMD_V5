
import { NextResponse } from 'next/server';
import { generateFlutterProject } from '@/lib/app-builder/flutter-gen';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const REPO_ROOT = process.cwd(); // Should be root of Next.js app
const GENERATED_DIR = path.join(REPO_ROOT, 'generated-app');

function runCommand(cmd, cwd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running ${cmd}:`, stderr);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

export async function POST(request) {
    try {
        const { config, supabaseUrl, supabaseKey } = await request.json();
        
        if (!config || !config.name) {
            return NextResponse.json({ error: "Invalid config" }, { status: 400 });
        }

        console.log("Generating Flutter Project for:", config.name);
        const files = generateFlutterProject(config, supabaseUrl, supabaseKey);

        // 1. Write files to generated-app folder
        if (fs.existsSync(GENERATED_DIR)) {
            fs.rmSync(GENERATED_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(GENERATED_DIR, { recursive: true });

        // Helper to write recursively
        Object.entries(files).forEach(([filePath, content]) => {
            const fullPath = path.join(GENERATED_DIR, filePath);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(fullPath, content);
        });

        // 2. Commit and Push
        // Check if we are in a git repo
        try {
            await runCommand('git status', REPO_ROOT);
        } catch (e) {
            return NextResponse.json({ error: "Server is not a git repository. Please initialize git." }, { status: 500 });
        }

        // Configure git if needed (locally it uses user config)
        await runCommand('git add generated-app', REPO_ROOT);
        
        try {
            await runCommand('git commit -m "Auto-generate Flutter App"', REPO_ROOT);
        } catch (e) {
            // Might be nothing to commit
            console.log("Nothing to commit or commit failed");
        }

        // Check if remote exists
        try {
             await runCommand('git remote get-url origin', REPO_ROOT);
        } catch (e) {
             return NextResponse.json({ error: "No remote 'origin' configured. Please add a GitHub remote." }, { status: 500 });
        }


        // ... (Push code) ...
        // Push to build-artifacts branch
        try {
            await runCommand('git push origin HEAD:build-artifacts --force', REPO_ROOT);
        } catch (e) {
             return NextResponse.json({ error: "Failed to push to GitHub. Check permissions." }, { status: 500 });
        }

        // 3. Get Repo Info & Latest Run ID
        let runId = null;
        try {
            const remoteUrl = await runCommand('git remote get-url origin', REPO_ROOT);
             // Parse owner/repo from URL (supports https and ssh)
            // https://github.com/owner/repo.git or git@github.com:owner/repo.git
            const match = remoteUrl.match(/github\.com[:\/]([^\/]+)\/([^\.]+)/);
            if (match) {
                const owner = match[1];
                const repo = match[2];
                
                // Wait a moment for GitHub to register the event
                await new Promise(r => setTimeout(r, 5000));

                if (process.env.GITHUB_TOKEN) {
                    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs?branch=build-artifacts&event=push&per_page=1`;
                    console.log("Fetching runs from:", apiUrl);
                    
                    const runsRes = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    
                    const runsData = await runsRes.json();
                    console.log("GitHub Runs Data:", JSON.stringify(runsData));

                    if (runsRes.ok && runsData.workflow_runs && runsData.workflow_runs.length > 0) {
                        runId = runsData.workflow_runs[0].id;
                    } else {
                         // Debug: Attach error to response
                         console.error("No runs found or API error:", runsData);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to fetch Run ID:", e);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Build triggered! If tracking fails, check GitHub Actions manually.", 
            runId: runId,
            debug: { runId }
        });

    } catch (error) {
        console.error("Build API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
