# Implementation Plan: AI-Powered Android Event App Generator

This plan outlines the technical approach to migrate the `app-builder` from its current React-source-code generation model to the new **Preview-First, Config-Driven Expo Architecture**.

## User Review Required

> [!IMPORTANT]
> The biggest shift here is dropping the `lib/app-builder/flutter-gen` folder. The current system writes raw Flutter source code as text. We will instead build a **standalone Expo App Template** repository. The web builder will only output a [config.json](file:///c:/WebDev/websiteBuilder/KaggleGithubV1/frontend/jsconfig.json) that this Expo template consumes at build time.
> 
> Please confirm this architectural pivot is correct before we begin.

## Phase 1: Expo App Template Foundation (Layer 5)
Instead of generating code from scratch for every user, we need a "Master App Template" written in React Native (Expo).
- **Action**: Create a new Expo project.
- **Architecture**: A modular tab/drawer based navigation where modules (Registration, Announcement, etc.) are conditionally rendered based on a [config.json](file:///c:/WebDev/websiteBuilder/KaggleGithubV1/frontend/jsconfig.json) file.
- **Offline Engine**: Initialize `expo-sqlite` and a queue manager for write-operations. Provide a generic Sync Manager that connects to Firebase when online.

## Phase 2: FastAPI Config Engine (Layer 2)
The backend service responsible for managing the state of the app configuration.
- **Action**: Create a new Python FastAPI service.
- **Core Endpoints**: 
  - `POST /config/validate`: Enforces the **Strict Config Schema**. Checks for **Limits & Guardrails** (Max 8 modules), validates themes, and runs **Module Dependency Rules**.
  - `POST /config/chat-patch`: Takes the current config JSON and user input. Uses an LLM with **Strict Prompt Sanitization**. Employs **Config Versioning** and API Rate Limiting. Ensures structural generation is blocked if the App Lifecycle is `LIVE`.

## Phase 3: Frontend Web Restructure (Layer 1)
Modify [src/app/dashboard/app-builder/new/page.js](file:///c:/WebDev/websiteBuilder/KaggleGithubV1/frontend/src/app/dashboard/app-builder/new/page.js) to match the new 3-panel layout.
- **Left Panel (Manual Config)**: React forms for Base Theme and Module toggles. Includes **Smart Suggestions** ("Add coupons to increase engagement"). Built on **Default Templates** (Tech Fest, Cultural Fest).
- **Center Panel (Live Preview)**: An `<iframe>` pointing to the Expo Web build of the Master Template. Features a **Demo Mode Toggle** which instantly injects mock data so the preview is visually complete for hackathon pitches.
- **Right Panel (AI Chat)**: Enhance chat interface to support file uploads and version history playback.

## Phase 4: Expo App Template Foundation (Layer 5 & Core Features)
Instead of generating generic Dart code, build a standalone Expo App Template representing the final application.
- **Action**: Create the Master Expo project.
- **Realtime Data Contract**: Build an offline-first SQLite engine (`expo-sqlite`) with an **Error Handling/Retry Queue**. Fetch dynamic data via Firebase based on strict Security Rules.
- **Performance Strategy**: Implement Lazy Loading, Pagination for feeds/stalls, and Local Image Caching. Ensure every feed features an **Empty State UX**.
- **Centralized Monetization Engine**: Global sponsor slot system injecting ad banners.
- **Sponsor ROI Analytics**: Implement tracking for Impressions, Clicks, and Coupon Claims syncing back to the Admin Dashboard.
- **Module Implementation (Iterative)**: Implement all 11 core modules natively.

## Phase 5: Build Lifecycle & Export Pipeline 
- **App Lifecycle State Machine**: Track the event app from `DRAFT` -> `PREVIEW` -> `GENERATED` -> `LIVE`.
- **Config -> Build Freeze**: Post-generation, structural edits like themes and modules are programmatically rejected by the backend.
- **Export Trigger**: When the user clicks "Download APK" on the web:
  1. The pipeline catches GitHub Actions/EAS timeouts and exposes logs/retry buttons in the UI.
  2. The final [config.json](file:///c:/WebDev/websiteBuilder/KaggleGithubV1/frontend/jsconfig.json) is injected and shipped.
  
### Initial Focus
I recommend starting with **Phase 1 (The Expo Base Template)** to establish the [config.json](file:///c:/WebDev/websiteBuilder/KaggleGithubV1/frontend/jsconfig.json) schema rules. Once we have a working template that can render different UI based on a static JSON file, we can hook it up to the Web Frontend and the FastAPI Chat Engine.
