
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { generateFlutterProject } from '@/lib/app-builder/flutter-gen';

const WORKFLOW_YAML = `name: Build APK
on:
  repository_dispatch:
    types: [build-apk]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.0'
          channel: 'stable'

      - name: Create Flutter Project
        run: |
          flutter create --org com.appbuilder --project-name appbuilder_app .
          rm -rf lib/main.dart test/

      - name: Write Project Files
        env:
          PROJECT_FILES: \${{ toJson(github.event.client_payload.project_files) }}
        run: |
          echo "$PROJECT_FILES" > files.json
          node -e "
            const fs = require('fs');
            const path = require('path');
            const files = JSON.parse(fs.readFileSync('files.json', 'utf8'));
            Object.entries(files).forEach(([fpath, content]) => {
                if(fpath.includes('.github')) return; 
                const p = path.resolve(fpath);
                fs.mkdirSync(path.dirname(p), { recursive: true });
                fs.writeFileSync(p, content);
                console.log('Written:', fpath);
            });
          "
          
      - name: Update build.gradle (SDK Versions)
        run: |
             sed -i 's/minSdkVersion flutter.minSdkVersion/minSdkVersion 21/g' android/app/build.gradle
             sed -i 's/targetSdkVersion flutter.targetSdkVersion/targetSdkVersion 34/g' android/app/build.gradle
             sed -i 's/compileSdkVersion flutter.compileSdkVersion/compileSdkVersion 34/g' android/app/build.gradle

      - name: Get Dependencies
        run: flutter pub get

      - name: Build APK
        run: flutter build apk --release --no-tree-shake-icons

      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: build/app/outputs/flutter-apk/app-release.apk
`;

export async function POST(request) {
  try {
    const config = await request.json();
    const repoName = `WebsiteBuilder-app-${config.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now().toString().slice(-4)}`;
    
    // Initialize Octokit
    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN is not set in environment variables");
    }
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    // 1. Create Repository
    console.log(`Creating repo: ${repoName}`);
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: false, 
      auto_init: true, 
    });

    console.log(`Repo Created: ${repo.html_url}`);
    
    // 2. Wait for Initialization
    await new Promise(r => setTimeout(r, 5000));
    
    // 3. Canary Test: Create simple file
    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: repo.owner.login,
            repo: repoName,
            path: "canary_test.txt",
            message: "Verify repo access",
            content: Buffer.from("System Check").toString('base64'),
        });
    } catch (e) {
        console.error("Canary File Failed:", e.message);
        throw new Error(`Repo not accessible after creation: ${e.message}`);
    }

    // 4. Push Workflow File
    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: repo.owner.login,
            repo: repoName,
            path: ".github/workflows/build-apk.yml",
            message: "Add build workflow",
            content: Buffer.from(WORKFLOW_YAML).toString('base64'),
        });
    } catch (e) {
        console.error("Workflow Push Failed:", e.message);
        throw new Error("Your GITHUB_TOKEN is missing the 'workflow' scope.");
    }

    // 4.5 Wait for Workflow Registration
    await new Promise(r => setTimeout(r, 10000));

    // 5. Trigger Build
    const files = generateFlutterProject(config);
    delete files['.github/workflows/build.yml'];

    console.log("Dispatching build event...");
    await octokit.repos.createDispatchEvent({
        owner: repo.owner.login,
        repo: repoName,
        event_type: "build-apk",
        client_payload: {
            project_files: files
        }
    });

    return NextResponse.json({ 
        success: true, 
        repoUrl: repo.html_url,
        actionsUrl: `${repo.html_url}/actions`,
        owner: repo.owner.login,
        repo: repoName
    });

  } catch (error) {
    console.error('Build API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
