### Task 6: Telas de Login e Cadastro

**Files:**
- Create: `src/components/auth/LoginView.tsx`
- Create: `src/components/auth/SignupView.tsx`

**Interfaces:**
- Consumes: `useAuth()` from `src/contexts/AuthContext.tsx` (already implemented in Task 5 — exposes `{ user, session, loading, signIn, signOut }`) for login; calls `fetch` directly on the Edge Function `validate-invite-and-signup` (already deployed) for signup — signup does NOT use `supabase.auth.signUp()` client-side, because invite-code validation must happen server-side before the account is created.
- Produces: components `<LoginView onSwitchToSignup={() => void} />` and `<SignupView inviteCodeFromUrl={string | null} onSwitchToLogin={() => void} onSignupSuccess={() => void} />`. These get mounted in `App.tsx` in Task 9 (not this task — don't wire them into `App.tsx`).

## Visual direction (already approved by the project owner — follow exactly, do not invent a new visual style)

These screens must look like a natural extension of the app's EXISTING visual language, matching the app's current shared-passcode gate screen pixel-for-pixel in style. Reference implementation to copy the pattern from: `src/App.tsx` lines ~484–518 (the `if (!isAccessUnlocked)` block, which you are NOT modifying — Task 9 removes it — but you should read it now as the styling template).

Concretely:
- Full-screen overlay: `fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6`
- Centered card: `max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold`
- Headline: serif (`font-serif` / the app's display font), `text-lg font-medium text-slate-900 dark:text-white`
- Subtext: `text-xs text-slate-500 dark:text-slate-400`
- Inputs: `w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100`
- Primary button: `w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer`
- Error text: `text-xs text-rose-500 font-medium`
- Secondary/switch-mode link: plain text button below the primary CTA, `text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline`, e.g. "Não tenho conta ainda" (login→signup) / "Já tenho conta" (signup→login)

**New requirement from the project owner (not in the original plan doc — apply it): both screens must always show the RenaSer logo and the animated flying butterfly, exactly as the rest of the app does.** Concretely:
- Import `RenaSerLogo` from `../RenaSerLogo` (relative to `src/components/auth/`, so `../RenaSerLogo`) and render `<RenaSerLogo variant="vertical" size={64} className="mb-2" />` above the headline, inside the card (or directly above it, matching how other full-screen states in the app center a header above a card — use your judgement to match spacing, but the logo must be clearly visible before the form).
- Import `ButterflyIcon` from `../ButterflyIcon` (so `../ButterflyIcon`) and render one as an ambient decorative element on the screen, following the pattern already used in `src/components/HomeView.tsx` around line 802: `<ButterflyIcon size={...} speedMultiplier={...} className="text-rosegold/30" />` positioned absolutely somewhere on the full-screen background (not inside the card, not obstructing the form) — e.g. `absolute top-10 right-8 pointer-events-none`. Pick a tasteful size (e.g. 32–40px) and position; this is ambient decoration, not a focal element.

**Dark mode:** use the exact same `dark:` classes already shown above (matching the existing passcode-gate pattern) — do NOT design a new dark mode. A broader dark-mode redesign is a separate future project the owner explicitly deferred; these two screens should look like every other dark-mode screen in the app today, nothing fancier.

- [ ] **Step 1: Implement `LoginView.tsx`**

```typescript
// src/components/auth/LoginView.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RenaSerLogo from '../RenaSerLogo';
import ButterflyIcon from '../ButterflyIcon';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

export default function LoginView({ onSwitchToSignup }: LoginViewProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none">
      <ButterflyIcon size={36} speedMultiplier={0.7} className="text-rosegold/30 absolute top-10 right-8 pointer-events-none" />
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Bem-vinda de volta
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Continue sua jornada de 30 dias
          </p>
        </div>
        <div className="space-y-3 text-left">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
        >
          Não tenho conta ainda
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Implement `SignupView.tsx`**

```typescript
// src/components/auth/SignupView.tsx
import { useState } from 'react';
import RenaSerLogo from '../RenaSerLogo';
import ButterflyIcon from '../ButterflyIcon';

interface SignupViewProps {
  inviteCodeFromUrl: string | null;
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

export default function SignupView({ inviteCodeFromUrl, onSwitchToLogin, onSignupSuccess }: SignupViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(inviteCodeFromUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/validate-invite-and-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? 'Não foi possível criar a conta.');
        setSubmitting(false);
        return;
      }
      onSignupSuccess();
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] dark:bg-[#1E1715] flex flex-col justify-center items-center p-6 text-center select-none">
      <ButterflyIcon size={36} speedMultiplier={0.7} className="text-rosegold/30 absolute top-10 right-8 pointer-events-none" />
      <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-6 p-8 rounded-3xl border border-rosegold/20 bg-white dark:bg-[#251E1C] shadow-rosegold">
        <RenaSerLogo variant="vertical" size={64} className="mx-auto mb-2" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-serif font-medium text-slate-900 dark:text-white">
            Comece sua jornada
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Crie sua conta com o código de convite que você recebeu
          </p>
        </div>
        <div className="space-y-3 text-left">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
            required
            minLength={6}
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de convite"
            required
            className="w-full bg-[#FAF8F5] dark:bg-[#1E1715] border border-rose-100/30 dark:border-rosegold/10 focus:border-rosegold focus:outline-none rounded-2xl p-3.5 text-sm text-slate-800 dark:text-slate-100"
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-rosegold hover:bg-[#A35D68] text-white rounded-2xl text-xs font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-60"
        >
          {submitting ? 'Criando conta...' : 'Criar conta'}
        </button>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs text-rosegold/80 hover:text-rosegold underline-offset-4 hover:underline"
        >
          Já tenho conta
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verify (build)**

```bash
npx tsc --noEmit
npm run build
```

Expected: no new errors from these two files (the project has pre-existing `tsc` errors in unrelated `supabase/functions/*` Deno files — not your concern, see note below).

Known pre-existing issue, not caused by your changes: `npx tsc --noEmit` reports errors in `supabase/functions/*` because `tsconfig.json` doesn't scope Deno files out of the Vite app's type-check. Confirm your two new files add zero *additional* errors beyond that pre-existing set (e.g. run `git stash`, run `tsc`, count errors, `git stash pop`, run `tsc` again, compare counts).

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/LoginView.tsx src/components/auth/SignupView.tsx
git commit -m "feat(auth): telas de login e cadastro"
git push origin main
```
