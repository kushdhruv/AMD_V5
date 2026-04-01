# Home/Hub Redesign Plan (0→100)

## 1. Objective

- Move current `HomeScreen` content into a new `HubScreen` and keep it unchanged.
- Implement a brand-new `HomeScreen` that matches provided mockups (hero image/video, story row, curated posts).
- Add a new bottom tab bar item: `Home`, `Hub`, `Explore`, `Profile`.
- Apply free-user upload cap: 4 stories + 4 posts.
- Keep `Explore` and all other tabs as currently implemented.

## 2. Current code baseline (existing repo structure)

- `App.tsx`: main bottom tab navigator.
- `src/navigation/FeatureRegistry.ts`: controls module-based tab visibility.
- `src/screens/HomeScreen.tsx`: current home logic with announcements and quick actions.
- `src/screens/ExploreScreen.tsx`, `src/screens/ActivitiesScreen.tsx`, `src/screens/ProfileScreen.tsx`.
- `src/components` and `src/theme` contain shared UI primitives (ThemeText, ThemeBadge, ThemeCard etc.).
- `src/hooks/useLocalData.ts`: existing pattern for fetching local data.

## 3. Phase 0: Alignment and architecture

1. Confirm UX in design and map to components.
2. Determine data API for stories/posts and limit enforcement.
3. Agree on whether to use feature flags in config (recommended for A/B and rollout).

## 4. Phase 1: Navigation and Hub migration

1. Create `src/screens/HubScreen.tsx` and migrate current `HomeScreen` content to it.
2. In `App.tsx`, add `Hub` to `Tab.Navigator`:
   - `name="Hub"`
   - `component={HubScreen}`
   - `tabBarIcon=` with `TabIcon` emoji (e.g., 🔥 or 🏙️)
3. Keep existing `Home` tab and its route; implement in phase 2 as new design.
4. Keep `FeatureRegistry` as-is (Explore still conditional with `nav.showExploreTab`).

## 5. Phase 2: New Home screen design

1. Replace `src/screens/HomeScreen.tsx` with new design:
   - `HeroCarousel` (top 1-3 event cards with live indicator).
   - `StoriesRow` (horizontal `FlatList`, 4 max, circle thumbnails). 
   - `TopPostsGrid` (vertical `FlatList`, 4 max cards).
   - Buttons: `Add Story`, `Add Post` (disabled after limit reached).
2. Create reusable components under `src/components`:
   - `StoryBubble.tsx`
   - `PostCard.tsx`
   - `MediaCard.tsx` / `MediaPreview.tsx`
3. Implement placeholder and shimmer loader states.

## 6. Phase 3: Data + persistence

1. Database schema (Supabase):
   - `user_stories`: `id`, `user_id`, `title`, `type`, `media_url`, `thumb_url`, `created_at`.
   - `user_home_posts`: `id`, `user_id`, `caption`, `type`, `media_url`, `created_at`.
2. API endpoints:
   - `GET /home/stories?user_id=...` (limit 4)
   - `POST /home/stories` (enforce 4 limit)
   - `DELETE /home/stories/:id`
   - same scheme for posts.
3. Backend application logic: enforce per-user 4-story/4-post cap at create.
4. Optional DB constraint or trigger for race-safe limit.

## 7. Phase 4: Client hooks + upload flow

1. Add new hooks:
   - `useHomeMedia` from `src/hooks/useHomeMedia.ts`:
     - returns `{ stories, posts, loading, error, refresh }`
   - `useUploadQuota`:
     - returns `{ storyCount, postCount, remainingStories, remainingPosts }`
2. In `HomeScreen`, fetch with `useHomeMedia` and render results.
3. Upload flow:
   - `fetch` support for image/video picks (e.g., `expo-image-picker`).
   - `navigate('UploadStory')` / `navigate('UploadPost')` (can be modal or stack screens).
4. Enforce disabled state:
   - When `storyCount >= 4`, disable story upload.
   - When `postCount >= 4`, disable post upload.

## 8. Phase 5: Performance and quality safeguards

1. Enforce list limits: 4 plus conservative app page size.
2. use `FlatList` for stories/posts; avoid raw `ScrollView` for lists.
3. Image optimization: use `FastImage` or `expo-image` with old/new res.
4. Video performance: static preview only; open in separate screen for play.
5. Avoid automatic simultaneous video playback.
6. Test on low-end hardware and set performance budget (60fps / <100ms load).

## 9. Phase 6: Hub and Explore isolation

1. Keep `HubScreen` logic wide compatible with existing content.
2. Do not alter `ExploreScreen` behavior unless new features needed.
3. Ensure `Hub` navigation route is a copy; no dependencies on new story list unless explicitly desired.

## 10. Phase 7: QA/test

1. Functional user flows:
   - open Home, add story/post until 4.
   - check limit enforcement.
   - switch to Hub, confirm original home content.
   - confirm Explore unchanged.
2. E2E and regression tests.
3. Error flows for limit reached and upload failure.
4. Accessibility labels and verification.

## 11. Phase 8: release + metrics

1. Add feature flags: `homeRedesign` / `hubLegacy`.
2. rollout in steps (10%, 50%, 100%).
3. track metrics:
   - home/hub switch event
   - limit hit counter
   - media load times
   - user engagement

## 12. Notes & constraints

- This plan adheres to the current app architecture in `expo-template`.
- It preserves the existing navigation model and theme patterns.
- It ensures stability of existing flows while rolling out new features incrementally.
- Free-tier upload cap is implemented in backend + frontend guard.

---

### Optional next task
Create skeleton code for `src/screens/HubScreen.tsx`, `HomeScreen.tsx` (redesign), and `src/hooks/useHomeMedia.ts` and provide a PR-ready patch.
