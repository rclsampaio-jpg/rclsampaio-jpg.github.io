# RenaSer

## What this is

RenaSer is a 30-day "visibility & confidence" journey app for Brazilian
Portuguese-speaking creators (women, primarily), built by Renata (repo
owner) as her own product. It's a React 19 + TypeScript + Vite 6 +
Tailwind v4 SPA, no backend — all user state lives in `localStorage`.

Deployed at **https://rclsampaio-jpg.github.io** via GitHub Pages.
Repo: `rclsampaio-jpg/rclsampaio-jpg.github.io`, branch `main`.
**Every push to `main` auto-deploys** via `.github/workflows/deploy.yml`
(GitHub Actions → `npm run build` → `actions/deploy-pages`). There is no
staging environment — pushing to `main` is pushing to production.

## Commands

```bash
npm run dev      # vite dev server on :3000
npm run build    # production build to dist/
npm run lint     # tsc --noEmit (this is the actual type-check step)
```

Always run `npx tsc --noEmit` and `npm run build` before committing —
this project has no test suite, so a clean build is the only automated
safety net.

## Who you're working with

Renata is non-technical (product owner / creator, not an engineer). She
communicates in Portuguese and expects replies in Portuguese. She tests
almost exclusively on her **iPhone**, often via the **"Add to Home
Screen" standalone PWA icon**, not a regular Safari tab — this matters a
lot (see gotchas below), and when something only breaks for her and not
in a normal browser, ask whether she's on the installed icon vs. a
browser tab before guessing further.

Workflow she expects: implement → verify (browser preview and/or
`tsc`+`build`) → commit with a descriptive message → **push to `main`
immediately** (she never asked for a review step; "sobe"/"push" is
implicit in almost every request). She reads code changes at a glance
via screenshots, not diffs, so when something's still wrong after a fix
she'll usually reply with a phone screenshot — read it carefully, it's
often the fastest way to see the actual bug.

## Architecture patterns worth knowing before you touch things

**localStorage versioned caching.** Two version constants gate cached
data: `DAYS_CONTENT_VERSION` in `src/data/templateData.ts` and
`ECOSYSTEM_CONFIG_VERSION` in `src/data/ecosystemData.ts`. Each gates a
family of `localStorage` keys (`renaser_days`/`renaser_days_version`,
`renaser_*_config_version`, etc.). **Bump the relevant version constant
any time you change the corresponding `DEFAULT_*`/`INITIAL_*` data** —
otherwise returning users keep seeing stale cached content instead of
your change, since the loader only overwrites `localStorage` when the
stored version doesn't match.

**Local-date handling.** Always use `getLocalDateISO()` from
`src/utils/date.ts` for "what's today" logic — never
`new Date().toISOString()`, which converts to UTC first and silently
shifts the date for anyone behind UTC (Brazil, UTC-3) during part of the
day.

**Day-unlock rule** (`src/utils/date.ts`,
`getUnlockAnchorDateISO()` + `LATE_NIGHT_UNLOCK_CUTOFF_HOUR = 6`):
completing a day late at night (before 6am) backdates the unlock anchor
to "yesterday" so the next day opens immediately; completing at a normal
hour waits for the real next calendar date. This replaced a naive
`lastActiveDate === today` check that trapped anyone finishing a day
right after midnight. The anchor is stored per-progress as
`dayUnlockAnchorDate` (`UserProgress` in `src/types.ts`) and re-checked
in `HomeView.tsx`, `DailyMissionView.tsx`, and `JourneyView.tsx` — all
three must stay in sync if this rule changes again.

**PWA staleness.** No service worker. `src/main.tsx` fetches
`public/version.json` (written fresh on every `vite build`, cache
`no-store`) and force-navigates to a version-busted URL if it doesn't
match the version baked into the running bundle
(`vite.config.ts` → `__BUILD_VERSION__`). This exists because the iOS
standalone PWA icon caches aggressively and otherwise never notices a
new deploy on its own.

**Access gate.** `ACCESS_PASSPHRASE` in `src/App.tsx` (~line 73) gates
the whole app; unlock is timestamped in `localStorage` and expires after
`ACCESS_REASK_INTERVAL_MS` (3 days) — so "it didn't ask for the password"
is very often expected behavior, not a bug. Admin passphrase
(`ADMIN_PASSPHRASE`, ~line 92) gates the in-app CMS/debug tools. Don't
paste either value into chat/commit messages/docs — point to the source
line instead.

## iOS-specific gotchas (learned the hard way this session)

- **`position: fixed` breaks under a transformed ancestor.** Any CSS
  `transform` on an ancestor (including Framer Motion's inline
  `transform` from animating `x`/`y`/`scale`) turns `position: fixed` on
  a descendant into "fixed relative to that ancestor," not the real
  viewport. Full-screen overlays nested inside an animated `motion.div`
  need `createPortal(..., document.body)` to actually cover the
  viewport — see `HomeView.tsx`'s onboarding overlay for the pattern.
- **A CSS `transition-all` fights Framer Motion.** If an element is both
  a `motion.*` component (animating `opacity`/`transform` via inline
  styles) *and* has a Tailwind `transition-all` class, the two animation
  systems race over the same properties and produce a visible
  flash/flicker. Scope the CSS transition to the properties it actually
  needs (`transition-[background-color,box-shadow]`, etc.) and let
  Framer own opacity/transform exclusively (use `whileHover`/`whileTap`
  instead of CSS hover transitions on motion components).
- **`.docx` and mobile browsers don't mix.** iOS Safari can't render
  `.docx` inline and has no reliable download handling for it — links
  just open a blank tab. Any downloadable document in this app should be
  a **PDF**, and even then, don't rely on the browser's native PDF
  viewer chrome for a "download" button — especially inside the iOS
  standalone PWA, which often has none. `src/utils/download.ts`'s
  `forceDownload()` (fetch as blob → click a temporary object-URL
  anchor) is the reliable pattern; it's what both the Day-1 document
  link and the Library's PDF category use. Don't reintroduce a
  `window.open`/`target=_blank`/`<a download>` for PDFs — all three were
  tried and replaced for exactly this reason.
- **`-webkit-text-size-adjust: 100%`** and **`viewport-fit=cover`**
  (`index.html`/`src/index.css`) are there specifically because iOS can
  auto-inflate font sizes and misjudge safe-area sizing in standalone
  mode in ways that don't reproduce in a normal Safari tab.
- Google Docs' **"Download as .docx" only exports the currently active
  tab** when the source doc has multiple tabs — if a document you're
  asked to publish looks suspiciously short, that's very likely why;
  ask for the full/consolidated export rather than assuming your
  extraction missed something.

## Content model (brief map)

- `src/data/templateData.ts` — the 30 daily missions (`generateInitialDays`), audio file map (`DAILY_AUDIO_FILES`, convention `dia-NN.mp3`).
- `src/data/ecosystemData.ts` — community/support/mentoring config, Library assets (`INITIAL_LIBRARY_ASSETS`).
- `src/data/chaptersData.ts` — the 5 chapters (Despertar, etc.) days are grouped into.
- `src/utils/grammar.ts` — gender-agreement adaptation for pt/es text based on the user's stated grammar preference (feminine/masculine/neutral). See memory file `grammar_adaptation_system` if using Claude's memory — has a documented dead-state gotcha in `SystemEngine`.
- Assets: `public/assets/audio/`, `public/assets/docs/`, `public/assets/images/`.

## What NOT to do

- Don't add a service worker without understanding why one isn't there already (deliberate choice — see PWA staleness above; the version.json approach was chosen specifically to keep things simple).
- Don't revert the PDF-only policy for downloadable documents.
- Don't re-add `transition-all` to any `motion.*` element.
- Don't skip the version-constant bump when changing default content — it's the #1 recurring source of "I don't see my change" reports.
