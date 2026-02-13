# PetSubtitles Build Progress

## Phase 1: Project Scaffold & Config
- [x] Create Next.js app (Next.js 16, Tailwind v4, TypeScript)
- [x] Install deps (@anthropic-ai/sdk, heic2any)
- [x] Create folder structure (components, lib, public/icons, public/samples, scripts)
- [x] Configure env files, next.config, tailwind (CSS-based v4), manifest

## Phase 2: Placeholder Assets
- [x] Generate SVG assets (icons, OG image, samples)
- [x] Convert to PNG via sharp

## Phase 3: Root Layout & Global Styles
- [x] Layout with Fredoka + Nunito fonts, metadata, viewport
- [x] Global CSS with animations, utilities, Tailwind v4 theme

## Phase 4: Library Modules
- [x] lib/anthropic.ts (Claude vision API, voice styles)
- [x] lib/imageUtils.ts (HEIC conversion, resize, base64)
- [x] lib/imageCompositor.ts (subtitle overlay + story format)
- [x] lib/shareUtils.ts (Web Share API, download, clipboard)
- [x] lib/usageTracker.ts (3/day freemium, waitlist)

## Phase 5: API Route
- [x] app/api/translate/route.ts (rate limiting, validation, proxy)

## Phase 6: UI Components
- [x] Header (logo + remaining count)
- [x] PhotoCapture (upload zone, drag-drop, HEIC converting state, preview)
- [x] VoiceSelector (scrollable pills, premium lock)
- [x] TranslateButton (loading messages, paw dots)
- [x] PaywallModal (email waitlist, focus trap, keyboard dismiss)
- [x] ResultDisplay (composited image, caption)
- [x] ShareButtons (share, story, download, copy link, toast)
- [x] RecentHistory (localStorage carousel, restore)

## Phase 7: Main Page
- [x] app/page.tsx — state machine wiring all components

## Phase 8: Polish
- [x] Clean build (0 errors, 0 warnings)
- [x] Offline detection
- [x] Accessibility (aria labels, keyboard nav, focus trap)
- [x] QuotaExceededError handling in history

## Phase 9: Git Init
- [ ] Initialize repo and commit (waiting for user)
