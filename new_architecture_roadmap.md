# AI-Powered Android Event App Generator - Roadmap

## Part 1: Architecture Summary

### Core Philosophy
- No-code (user side)
- Template-driven (engineering side)
- Offline-first (real-world usable)
- Preview-first (trust + UX)

### System Layers
- **Layer 1: Frontend (React + Vite)**: Left panel for configuration, Center for lively iframe preview (Expo Web), Right panel for chat.
- **Layer 2: Config Engine (FastAPI)**: Translates user inputs & chat into strict JSON configs. No runtime AI content generation, only config patching.
- **Layer 3: Template Engine**: Assembles base Expo app + modules + theme + config.
- **Layer 4: Live Preview Engine**: Uses Expo + React Native Web so the preview is exactly what the final app will be.
- **Layer 5: Mobile App (Expo Base)**: The actual generated app with navigation, modules, offline engine, and themes.
- **Layer 6: Offline-First Engine**: Uses SQLite (`expo-sqlite`) with a sync queue.
- **Layer 7: Backend (Firebase)**: Authentication, storage, and sync for event features.
- **Layer 8: Build System**: Pushes to GitHub, uses GitHub Actions and EAS Build to output APK/QR Code.

## Part 2: Apps & Features (The Modules)

### Core Idea
The system is built on **Core Features (modules)** and **Sub-features (extensions/monetization tools)**. Each feature has a core experience, UI, optional add-ons, and monetization hooks.

### 1. Registration Module (Core System)
- **User App**: Registration form, QR ticket generation, profile view (offline access).
- **Admin**: View registrations, export data, manage access levels.
- **Sub-features**: VIP passes, group registration, bundle (ticket + coupons).
- **Monetization**: Paid tiers, VIP upgrades.

### 2. Stall Finder -> Commerce Module
- **User App**: List of stalls, filters (veg, price, type), stall detail page (menu, price, contact, "Order" button).
- **Admin**: Add/edit stalls, upload menus, mark sponsored stalls.
- **Sub-features**: "Order Now" (via Call/WhatsApp), coupons, featured stalls.
- **Monetization**: Featured listings, sponsored stalls, deal promotions.

### 3. Announcement Module
- **User App**: Event feed ("Now/Next/Upcoming"), swipeable cards, push notifications, countdown timers.
- **Admin**: Create announcements, schedule posts, send notifications.
- **Sub-features**: Targeted notifications, scheduled alerts.
- **Monetization**: Sponsored announcements, promoted notifications.

### 4. Live Scores Module
- **User App**: Leaderboard, score updates, rankings (highlight top teams).
- **Admin**: Update scores, manage competitions.
- **Sub-features**: Judge panel, score breakdown.
- **Monetization**: Sponsor per competition, branded leaderboard.

### 5. Voting Module
- **User App**: Polls, live results, vote-once system.
- **Admin**: Create polls, view results.
- **Sub-features**: Rewards (coupon for voting), trending polls.
- **Monetization**: Sponsored polls, brand placements.

### 6. Lost & Found Module
- **User App**: Post lost item (image-based), browse found items, claim request.
- **Admin**: Approve posts, manage claims.
- **Sub-features**: Verification (OTP/photo match).
- **Monetization**: Sponsor visibility, help desk promotion.

### 7. Sponsor / Ads Module (Critical Backbone)
- **User App**: Banners, sponsored cards, promoted listings.
- **Admin**: Add sponsors, upload creatives, choose placements.
- **Sub-features**: Analytics (clicks/impressions), targeted placement.
- **Monetization**: Premium placement pricing, category sponsorship.

### 8. Coupon / Deals Module (High Impact Add-On)
- **User App**: Coupon list, QR-based redemption, expiry timers, "claim now".
- **Admin**: Create coupons, assign to sponsors.
- **Monetization**: Paid coupon campaigns.

### 9. Event Info / Navigation Module
- **User App**: Event schedule, venue info.
- **Sub-features**: Map, directions.
- **Monetization**: Sponsored zones.

### 10. Global Payment System (UPI First)
- **User App**: Seamless UPI integration wherever payments are required (e.g., Ticket Purchases, VIP Upgrades, Deal Claims).
- **Admin**: Track all incoming transactions, refunds, and revenue splits.
- **Monetization**: Platform transaction fees.

### 11. Speaker / Team Profiles Module
- **User App**: Swipeable Cards (Tinder-style/carousel) showing photo, name, role, bio, schedule, and social links. "Add to Schedule" button.
- **Admin**: Add/edit profiles, assign to events, upload images.
- **Sub-features**: Featured profiles, "Notify when live", add to calendar.
- **Monetization**: Featured speaker placement, "Powered by [Sponsor]" on profile cards, sponsored artist highlights.

## Admin Dashboard (Web-Only Control Center)
**CRITICAL RULE:** All admin functionalities, configurations, analytics, and content moderation are hosted **strictly on the Web Admin Dashboard**. The generated Mobile App is 100% for end-users (attendees) and contains ZERO admin controls.

### Pre-Download vs. Post-Download Permissions:
- **Pre-Download (App Builder Phase)**: The organizer has full control over the app's structure, themes, colors, typography, and module selection. They use the React+Vite frontend and AI chat to design the app.
- **Post-Download (Admin Dashboard Phase)**: Once the app is generated and downloaded, the core structure and themes are **LOCKED**. The admin can ONLY change **dynamic content** (e.g., event timings, stall prices, venue details, adding/removing speaker profiles, announcements). They *cannot* redesign the app's theme or structural UI.

## AI Chat Interface (App Builder Phase)
- **Dynamic UX/UI Editing**: Users can modify themes, colors, module names, and UI elements directly via the chat panel. The LLM translates these requests into strict JSON payload updates.
- **Prompt Enhancement & Generation**: The LLM will assist users by enhancing their prompts, generating boilerplate text, or filling in gaps based on context.
- **Rich Media & File Uploads**: The chat interface natively supports photo/file uploads. Users can attach stall menus, campus maps, or speaker headshots directly in the chat, which the backend will process and map to the correct config paths.

## System Flow & Positioning
Select Features -> Add Details -> Live Preview (Expo Web) -> Chat Customize -> Generate App -> Admin Uses Dashboard -> Users Use App.

## 🌟 The 5 Must-Fix Systems (Critical Enhancements)

### 1. Centralized Data Flow (Admin ➔ App)
**"All dynamic data is fetched from the backend (Firebase/Supabase) and synced via the offline-first SQLite engine."**
Admin dashboard updates immediately map to Firebase. The app sync engine securely downloads the diff to `expo-sqlite`, ensuring offline reliability. Example collections: `registrations`, `announcements`, `stalls`, `votes`, `sponsors`.

### 2. Strict Config Schema (The Backbone)
The absolute source of truth. Without a rigid schema, previews and LLM patches break.
```json
{
  "event": { "name": "", "logo": "" },
  "modules": {
    "registration": true,
    "stalls": { "enabled": true, "sub_features": ["menu"] }
  },
  "theme": {}, "labels": {}, "monetization": {}
}
```

### 3. Centralized Monetization Engine
Sponsors aren't hardcoded; they exist as prioritized slots injected dynamically.
`"sponsor_slots": [ { "placement": "home_banner", "type": "banner", "priority": "high" } ]`
Placements trigger across Home, Stalls, Leaderboards, and Notifications dynamically.

### 4. Event Analytics Layer
Basic tracking makes sponsors pay. The app tracks: app opens, ad clicks, stall views, coupon claims. The Admin Dashboard visualizes impressions, clicks, and top modules.

### 5. Module Dependency Rules
Prevents broken apps. The schema validator enforces logical requirements:
- `if leaderboard -> require live_scores`
- `if coupons -> require stalls`

## Smart Additions
- **Order Flow (Click to WhatsApp)**: Clicking "Order" on a stall pre-fills a WhatsApp message. No complex order-backend required, yet powerful execution.
- **Smart Logic & Templates**: Providing default "Fest" or "Cultural" templates to accelerate onboarding. The UI will smartly suggest related modules (e.g., "Add VIP -> increase revenue").
- **Mock Data Injection**: Previews are injected with fake stalls, announcements, and leaderboards so the UI feels alive before real data is added.
- **Config Versioning**: Supporting Undo/Redo across the LLM chat by tracking `v1 -> v2 -> v3` states.
- **Role-Based Access**: Simple super-admin, event organizer, and stall owner separations in the dash.

## 🛡️ Production & Hackathon-Grade Tightening

To ensure the platform is robust, demo-friendly, and enterprise-ready, the following systems are strictly enforced:

### 1. App Lifecycle States
Every app exists as a versioned entity navigating through a strict state machine: `DRAFT` ➔ `PREVIEW` ➔ `GENERATED` ➔ `LIVE` ➔ `ARCHIVED`. This enables version control, prevents confusion, and allows organizers to iterate safely.

### 2. Config ➔ Build Freeze Rule
Once an app state shifts to `GENERATED` / `LIVE` (post-download), a strict freeze rule is enforced. **Theme and Modules are locked.** Only dynamic data (announcements, stall prices, speaker bios) is editable in the admin dashboard. This prevents breaking builds and UX mismatch.

### 3. Error Handling Layer
The system does not assume success:
- **Build Failures**: GitHub/EAS Action timeouts automatically capture logs and prompt a retry.
- **Sync Failures**: Offline-first engines queue mutations and retry seamlessly when internet returns.
- **Invalid Configs**: The API blocks generation and highlights the exact JSON error.

### 4. Limits & Guardrails
To prevent UI clutter and system bloat, hard limits are enforced:
- Maximum active modules: **8**
- Maximum sponsors: **10**
- Hard limits on daily push notifications.

### 5. Performance Strategy
The mobile application (Expo) employs:
- **Lazy loading** for heavy modules (like the Sponsor Banner engine).
- **Pagination** for lists (e.g., Stalls fetch 20 at a time).
- **Image Compression** pipeline before Supabase storage.

### 6. Security & Access Control
- **Firebase Security Rules** enforcing data isolation per App ID.
- **Role-Based Access**: `Super Admin`, `Event Organizer`, and `Stall Owner` (optional).
- **LLM Input Sanitization** and strict API Rate Limiting to prevent prompt injection and abuse.

### 7. Sponsor ROI Metrics
Analytics explicitly framed to track revenue generation in the Admin Dashboard:
- **Impressions**, **Clicks**, **Conversions (Coupon CLAIMS)**, and **Stall Visits**.

### 8. Empty State UX
Polished fallback screens indicating "No stalls yet — stay tuned" or "Announcements coming soon," rather than blank canvases.

### 9. Fail-Proof Demo Mode
An integrated "Demo Mode" toggle that generates an app with rich, pre-filled MOCK content (stalls, fake announcements, sample leaderboard) guaranteeing a flawless presentation during pitches.

**Final Positioning:**
*"A no-code platform for creating revenue-generating, customizable event apps with built-in admin control."*
