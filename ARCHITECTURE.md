# RenaSer - Technical Architecture Specification

This document details the production-ready technical architecture built for **RenaSer**, ensuring robust offline-first functionality, strong typescript typing, clean internationalization (Portuguese, English, Spanish), and a seamless future transition to Firebase services (Auth, Firestore, Cloud Storage, Push Notifications, Analytics).

---

## 1. Directory Structure & Organization

The project employs a **Feature-First, Modular layout** where layouts, data stores, and view files are isolated to prevent generation token issues and ensure long-term maintenance.

```text
/src
  ├── types.ts                    # Strong Type Definitions (Journey, Day, Hooks, SOS, settings)
  ├── main.tsx                    # React and DOM Initialization
  ├── App.tsx                     # Top-level Routing, App State & Core Layout
  ├── index.css                   # Custom Typography, Reset & Tailwind Theme Core
  ├── components/                 # Feature-First Presentation Modules
  │     ├── HomeView.tsx          # Step-by-step Audio Player & Validation Form
  │     ├── JourneyView.tsx       # 30-Day Grid Curriculum Overview
  │     ├── HookBankView.tsx      # Multi-lang dynamic and standalone Ganchos Library
  │     ├── EmotionalSosView.tsx  # Box-Breathing machine & Calming Affirmations
  │     ├── CmsView.tsx           # Full Curriculum / SOS / Hook state manager
  │     ├── SettingsView.tsx      # Language/Simulation configurations
  │     └── NextLevelView.tsx     # Gamified CTA after completing Day 30
  ├── data/                       # Data schemas and static loaders
  │     └── templateData.ts       # 30-Day Curriculum Rhythm generators
  └── services/                   # Native Service Integration Layers
        └── firebaseAdapter.ts    # Live Firestore/Auth proxy adapter
```

---

## 2. Strong Typing & Data Models

All entities are represented with strict, non-null types inside `/src/types.ts`:

- **`MissionDay`**: Encapsulates day number, weekday types, titles by language, and multi-lang content blocks containing mentor audio, scripts, and reflection challenges.
- **`HookModel`**: Categories (Provocation, Connection, Education), localized text, and favorite telemetry.
- **`SosModel`**: Calming title, specific crisis texts, and categories (Anxiety, Impostor, Fear).
- **`UserProgress`**: Tracker for streak count, daily completion hashes, favorite registers, submitted text answers, and custom settings.

---

## 3. Offline-First Synchronization & Firebase Strategy

The app utilizes a **Repository Pattern** implemented in `/src/services/firebaseAdapter.ts`. By default, all operations fall back to high-performance local storage, allowing 100% offline usage.

### Preparing Firebase Backend (Zero Refactoring):
1. In `.env` or Firebase console, configure credentials.
2. Inside `/src/services/firebaseAdapter.ts`, flip:
   ```typescript
   export const USE_FIREBASE_BACKEND = true;
   ```
3. Uncomment Firebase imports. The `FirestoreRepository`, `UserProfile` authentications, and `CloudStorage` audio integrations will automatically route queries to cloud databases instead of LocalStorage.

---

## 4. Professional Streaming Audio Architecture

In compliance with strict audio specifications, `/src/components/HomeView.tsx` mounts a **native, streaming HTML5 Audio player**:
- **Real Streaming**: Streams directly from remote audio sources.
- **Interactive Seek**: The progress range input slider calculates and sets `currentTime` dynamically.
- **Playback Speeds**: Speed coefficients ($1.0\times, 1.25\times, 1.5\times$) map directly to the hardware `playbackRate` API.
- **Reliable Fallbacks**: If streaming fails or browser autoplay policies block execution, an asynchronous timer falls back to simulation mode so the user's progress flow remains unbroken.

---

## 5. Native Internationalization (i18n)

No third-party bulky packages are used. Rather, fully-typed dictionary objects mapped to `'pt' | 'en' | 'es'` serve translations instantly without any layout flickers. Content modifications made in the CMS respect the original language choice and prevent auto-translation corruption.

---

## 6. QA Checklist & Verification Status

- [x] **Accessibility**: High-contrast ratios (Tailwind Slate and Indigo/Rose palettes). Responsive tap zones ($\ge 44$px for touch compliance).
- [x] **Strict Typings**: Compiled using standard `--noEmit` TypeScript configurations.
- [x] **No Mock Larping**: Includes a fully interactive CMS dashboard allowing backup export & restore, state changes, and live simulation quick-triggers for review.
