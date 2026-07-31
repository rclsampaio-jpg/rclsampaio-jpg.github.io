### Task 9: Integrar tudo em `App.tsx` e remover o gate antigo

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/services/firebaseAdapter.ts`

**Interfaces:**
- Consumes: `AuthProvider`/`useAuth` (`src/contexts/AuthContext.tsx`), `LoginView`/`SignupView` (`src/components/auth/LoginView.tsx`, `src/components/auth/SignupView.tsx`), `InviteAdminPanel` (`src/components/auth/InviteAdminPanel.tsx`), `useProgressSync` (`src/hooks/useProgressSync.ts`) — all already implemented and merged to `main`.
- Produces: final app behavior — the shared-passcode gate is replaced by real login/signup, and progress syncs to the cloud.

This is a precision-editing task on a large existing file (~1200+ lines). Use exact string anchors below (search for them with your editor), not line numbers — the file may have drifted slightly since this brief was written.

- [ ] **Step 1: Read the current file first**

Read `src/App.tsx` in full before editing (or at least the regions named below) so you understand the surrounding structure before making changes.

- [ ] **Step 2: Remove the `ACCESS_PASSPHRASE` gate — the state/logic block**

Find this exact block (currently right after `const [mobileMenuOpen, setMobileMenuOpen] = useState(false);` and before the `// Admin-only gate for Brand Identity & Creator Studio (CMS).` comment):

```typescript
  // Shared-passcode gate for the whole ecosystem, so the link alone isn't
  // enough to get in. NOTE: same caveat as the admin gate below — this is a
  // deterrent against casual link sharing, not real per-user access control
  // (anyone with the passcode can still share passcode + link together).
  // Real enforcement would require server-side auth tied to a purchase record.
  // The unlock expires after ACCESS_REASK_INTERVAL_MS so the passcode is
  // re-asked periodically instead of staying unlocked forever on a device.
  const ACCESS_REASK_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
  const isAccessStillValid = () => {
    const unlockedAt = Number(localStorage.getItem('renaser_access_unlocked_at') || '0');
    return unlockedAt > 0 && (Date.now() - unlockedAt) < ACCESS_REASK_INTERVAL_MS;
  };
  const [isAccessUnlocked, setIsAccessUnlocked] = useState(() => isAccessStillValid());
  const [accessPassInput, setAccessPassInput] = useState('');
  const [accessPassError, setAccessPassError] = useState(false);
  const ACCESS_PASSPHRASE = 'renasci2026';

  const handleAccessUnlock = () => {
    if (accessPassInput.trim().toLowerCase() === ACCESS_PASSPHRASE.toLowerCase()) {
      setIsAccessUnlocked(true);
      localStorage.setItem('renaser_access_unlocked_at', String(Date.now()));
      setAccessPassError(false);
    } else {
      setAccessPassError(true);
    }
  };

```

Delete this entire block. Do NOT touch the `ADMIN_PASSPHRASE`/`isAdminUnlocked`/`handleAdminUnlock`/`handleAdminLock` block that follows it — that one stays exactly as-is (it's a separate, unrelated admin gate that the project owner explicitly wants kept).

- [ ] **Step 3: Remove the `ACCESS_PASSPHRASE` gate — the JSX render block**

Find this exact block (it's the `if (!isAccessUnlocked) { return (...) }` early-return, appears before `if (showOpeningSplash) {`):

```typescript
  if (!isAccessUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none">
        <div className="max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rosegold/10 text-rosegold flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
              {lang === 'pt' ? 'Acesso Exclusivo RenaSer' : lang === 'es' ? 'Acceso Exclusivo RenaSer' : 'Exclusive RenaSer Access'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'pt' ? 'Digite o código que você recebeu para entrar.' : lang === 'es' ? 'Ingresa el código que recibiste para entrar.' : 'Enter the code you received to continue.'}
            </p>
          </div>
          <input
            type="password"
            value={accessPassInput}
            onChange={(e) => { setAccessPassInput(e.target.value); setAccessPassError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAccessUnlock()}
            placeholder={lang === 'pt' ? 'Código de acesso' : lang === 'es' ? 'Código de acceso' : 'Access code'}
            className="w-full text-center bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
            autoFocus
          />
          {accessPassError && (
            <p className="text-xs text-rose-500 font-medium">
              {lang === 'pt' ? 'Código incorreto. Tente novamente.' : lang === 'es' ? 'Código incorrecto. Intenta de nuevo.' : 'Incorrect code. Please try again.'}
            </p>
          )}
          <button
            onClick={handleAccessUnlock}
            className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
          >
            {lang === 'pt' ? 'Entrar' : lang === 'es' ? 'Entrar' : 'Enter'}
          </button>
        </div>
      </div>
    );
  }

```

Delete this entire block too — it will be replaced by the login/signup branch described in Step 6.

- [ ] **Step 4: Replace the local progress state with `useProgressSync`**

Find and delete:

```typescript
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgressFromStorage());
```

Also find and delete (currently a few lines above `const handleLanguageChange`):

```typescript
  // Update localStorage when progress state changes
  const updateProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    saveUserProgressToStorage(newProgress);
  };
```

You will re-add both `progress` and `updateProgress` via the new hook in Step 6 — this step is just removing the old versions. Leave the line right after the old `progress` state declaration untouched:
```typescript
  const [days, setDays] = useState<MissionDay[]>(() => loadDaysFromStorage(progress.journeyStartDate));
```
(it references `progress.journeyStartDate`, which will still resolve correctly once `progress` comes from the new hook in the same scope).

- [ ] **Step 5: Restructure the component — split `App` into a wrapper + `AppContent`**

Find:
```typescript
export default function App() {
  const system = useSystem();
```

Replace with:
```typescript
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const system = useSystem();
```

Everything that was previously inside `export default function App() { ... }` now belongs inside this new `AppContent` function — since you're just renaming the function signature in place (not moving code), the rest of the file's existing body automatically ends up inside `AppContent` correctly, all the way to that function's closing `}` at the end of the file. Do not otherwise reorder or move code in this step.

- [ ] **Step 6: Add auth state, invite-code URL parsing, and the login/signup branch**

Immediately after the `function AppContent() {` line (i.e., right after `const system = useSystem();`), add:

```typescript
  const { user, loading: authLoading } = useAuth();
  const inviteCodeFromUrl = new URLSearchParams(window.location.search).get('codigo');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(inviteCodeFromUrl ? 'signup' : 'login');
```

Then, where Step 3 deleted the old `if (!isAccessUnlocked) { ... }` block, add this in its place:

```typescript
  if (authLoading) return null;

  if (!user) {
    return authMode === 'login' ? (
      <LoginView onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <SignupView
        inviteCodeFromUrl={inviteCodeFromUrl}
        onSwitchToLogin={() => setAuthMode('login')}
        onSignupSuccess={() => setAuthMode('login')}
      />
    );
  }

```

Note this new block goes in the SAME location the old `if (!isAccessUnlocked)` block occupied (right before `if (showOpeningSplash) {`) — it's a direct replacement, same position in the render flow.

- [ ] **Step 7: Wire up `useProgressSync` where the old progress state was**

Where Step 4 removed `const [progress, setProgress] = useState<UserProgress>(() => loadUserProgressFromStorage());`, add in its place:

```typescript
  const { progress, updateProgress } = useProgressSync(loadUserProgressFromStorage());
```

This single line replaces both the old `useState` line AND the old `updateProgress` function from Step 4 — don't add a separate `updateProgress` function anywhere else, this hook provides it.

- [ ] **Step 8: Add the new imports**

Near the top of the file, alongside the existing imports (e.g. next to the `RenataOSChat`/`DayCompletionOverlay` imports), add:

```typescript
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginView from './components/auth/LoginView';
import SignupView from './components/auth/SignupView';
import InviteAdminPanel from './components/auth/InviteAdminPanel';
import { useProgressSync } from './hooks/useProgressSync';
```

- [ ] **Step 9: Mount `InviteAdminPanel` in the admin area**

Find this exact block:

```typescript
            {activeTab === 'brand' && isAdminUnlocked && (
              <BrandIdentityView
                lang={lang}
              />
            )}
```

Replace with:

```typescript
            {activeTab === 'brand' && isAdminUnlocked && (
              <>
                <BrandIdentityView
                  lang={lang}
                />
                <InviteAdminPanel />
              </>
            )}
```

- [ ] **Step 10: Delete the unused Firebase adapter**

```bash
rm src/services/firebaseAdapter.ts
```

Confirm nothing imports it:
```bash
grep -rn "firebaseAdapter" src/
```
Expected: no output. (It was dead scaffolding, never imported — `USE_FIREBASE_BACKEND = false` and the real Firebase SDK calls were all commented out.)

- [ ] **Step 11: Verify (build)**

```bash
npx tsc --noEmit
npm run build
```

Expected: no new errors beyond the known pre-existing `supabase/functions/*` Deno-file errors (compare before/after count via `git stash`/`git stash pop` if unsure which errors are pre-existing — though after this task, `App.tsx` changes are large enough that you should read every reported error directly and confirm each one is either pre-existing or something you need to fix, rather than relying only on a count comparison).

- [ ] **Step 12: Manual verification in the browser**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser: expect to see `LoginView` (no session yet). Open `http://localhost:3000/?codigo=ABXEUEJR` (this is a real, unused invite code already sitting in the Supabase `invite_codes` table from Task 4's testing): expect to see `SignupView` with the code field pre-filled with `ABXEUEJR`. Take a screenshot or describe what renders in your report — don't just trust that `npm run build` passing means the UI is correct, this task changes user-facing render logic.

Do NOT attempt to complete a real signup/login flow in this step (that needs a real email you can receive mail at) — just confirm both screens render with the right initial state.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(auth): integra login/cadastro/sync no App, remove gate antigo e adapter morto"
git push origin main
```
