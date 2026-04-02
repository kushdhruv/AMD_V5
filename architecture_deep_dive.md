# Deep Dive: App Builder Architecture & Build Pipeline

This document provides a comprehensive technical overview of the "App Builder" ecosystem, covering the Frontend (Web), the Expo Template (Mobile), and the CI/CD bridge that connects them.

---

## 1. System Overview
The system allows users to "build" a custom mobile application by configuring a set of "Capabilities" (Modules) and themes on a web dashboard.

**The Lifecycle of an App Build:**
1.  **Configure**: User modifies settings in the `frontend` Dashboard.
2.  **Trigger**: User clicks "Approve Build", calling `/api/build-expo`.
3.  **Handoff**: The backend transforms the web configuration into a mobile-specific JSON format (`ExpoAppConfig`).
4.  **Inject**: A GitHub Action (`eas-build.yml`) takes this JSON and injects it into the `expo-template` folder.
5.  **Build**: Expo Application Services (EAS) builds the native APK/IPA using the injected configuration.

---

## 2. The Frontend (`/frontend`)
The frontend is a Next.js application that serves as the "Controller" for the entire build process.

### Key Components
-   **`AppConfig` (State)**: Defined in `src/lib/app-builder-v2/schema/configSchema.ts`, this is the Zod-validated object representing the user's intent (Event details, Theme, Enabled Modules).
-   **`ConfigPanel.tsx`**: The main UI component (`src/components/app-builder-v2/ConfigPanel.tsx`) that updates the config state.
-   **`configTransformer.ts`**: (CRITICAL) Located at `src/lib/app-builder-v2/schema/configTransformer.ts`. It maps the web-friendly schema to the exact shape expected by the mobile app's `config.json`.
    -   *Example: It maps `modules.songs (boolean)` to `modules.music (object)`.*

### API Endpoints
-   **`POST /api/build-expo`**:
    -   **When**: Called when the user clicks "Approve Build".
    -   **Action**: Verifies ownership, uploads base64 icons to Supabase Storage, transforms the config, and dispatches a GitHub Action via `Octokit`.
-   **`GET/POST /api/app-builder`**:
    -   **When**: During configuration.
    -   **Action**: Persists the "Draft" state of the app to the `projects` table in Supabase.
-   **`GET /api/config-v2`**:
    -   **When**: When loading the builder.
    -   **Action**: Fetches the latest saved configuration for a specific project.

---

## 3. The Bridge (`.github/workflows/eas-build.yml`)
This GitHub Action is the "Installer". It treats the `expo-template` as a generic shell and "installs" the custom configuration.

### Workflow Steps:
1.  **`Inject Generated config.json`**: Decodes the base64 config string from the API and writes it to `expo-template/src/config/config.json`.
2.  **`Patch app.json`**: Uses `jq` to change the `expo.name` and adaptive icon paths to match the user's event name.
3.  **`Inject Custom App Icon`**: Downloads the icon (from the URL or base64 data) and overwrites `expo-template/assets/icon.png`.
4.  **`Run EAS Build`**: Executes `eas build --platform android --non-interactive`.

---

## 4. The Expo Template (`/expo-template`)
The mobile application is an Expo/React Native app that is designed to be **entirely configuration-driven**.

### Architecture
-   **Configuration Ingestion**:
    -   `src/store/configStore.ts`: (HEART OF THE APP) A Zustand store that imports `src/config/config.json` at build time. It sets up the global state that every screen subscribes to.
    -   `src/types/config.ts`: Defines the types that must match the `configTransformer.ts` output.

-   **Dynamic Navigation**:
    -   `src/navigation/FeatureRegistry.ts`: A registry that maps module names (e.g., "leaderboard", "commerce") to their respective screens.
    -   The Bottom Tab Bar and Drawer only show icons for modules that are `isEnabled` in the `configStore`.

-   **Theming**:
    -   `src/theme/ThemeProvider.tsx`: Wraps the app and provides colors (primary, accent, background) directly from the `config.json`. Every component uses these dynamic tokens rather than hardcoded colors.

-   **Data Services**:
    -   `src/services/supabaseClient.ts`: Initializes the Supabase client.
    -   **Important**: The app uses the `project_id` from the config to filter all data (stalls, speakers, activities). This ensures a "multi-tenant" architecture where one codebase can be billions of different apps.

---

## 5. Troubleshooting & Common Failure Points
If "App Building is not working", check these in order:

1.  **Schema Mismatch**: Did a teammate add a field to `configSchema.ts` (Frontend) but forgot to update `configTransformer.ts` or the `ExpoAppConfig` type in the `expo-template`?
2.  **Base64 Payload Limit**: GitHub API has a ~65KB limit for `workflow_dispatch` inputs. If the `config.json` is too large (usually due to a massive base64 icon), the build will fail to trigger. (Current fix: `/api/build-expo` uploads icons to Supabase first).
3.  **EAS Secrets**: Ensure `EXPO_TOKEN` and `SUPABASE_KEY` are set in GitHub Repository Secrets.
4.  **Dependency Versions**: Ensure `./expo-template/package.json` doesn't have conflicting native modules. Always test locally with `npx expo prebuild` if native builds fail on EAS.

---
*Created by Antigravity AI for the AMD Event App Team.*
