### Task 8: Sincronização de progresso (`useProgressSync`)

**Files:**
- Create: `src/hooks/useProgressSync.ts`

**Interfaces:**
- Consumes: `useAuth()` from `src/contexts/AuthContext.tsx` (Task 5, done) for `user.id`; `supabase` client from `src/lib/supabase.ts` (Task 5, done); `saveUserProgressToStorage` from `src/data/templateData.ts` (already exists in the codebase, do not modify it); type `UserProgress` from `src/types.ts` (already exists).
- Produces: hook `useProgressSync(initialProgress: UserProgress)` returning `{ progress: UserProgress, updateProgress: (p: UserProgress) => void }`. This will replace `App.tsx`'s current local `progress` state + `updateProgress` function in Task 9 (not this task — don't touch `App.tsx`). The returned shape must match exactly what `App.tsx` currently uses locally, since Task 9 does a direct swap.

- [ ] **Step 1: Implement the hook**

```typescript
// src/hooks/useProgressSync.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { UserProgress } from '../types';
import { saveUserProgressToStorage } from '../data/templateData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SYNC_DEBOUNCE_MS = 2000;

export function useProgressSync(initialProgress: UserProgress) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInitialLoad = useRef(false);

  // Ao logar: busca progresso da nuvem; se nuvem vazia e há progresso local
  // (localStorage), sobe o local uma vez (migração de quem já usava o app).
  useEffect(() => {
    if (!user || didInitialLoad.current) return;
    didInitialLoad.current = true;

    (async () => {
      const { data: cloudRow } = await supabase
        .from('user_progress')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cloudRow?.data) {
        const cloudProgress = cloudRow.data as UserProgress;
        setProgress(cloudProgress);
        saveUserProgressToStorage(cloudProgress);
      } else {
        // Nada na nuvem ainda: migra o progresso local (se houver) para lá.
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          data: initialProgress,
          updated_at: new Date().toISOString(),
        });
      }
    })();
  }, [user, initialProgress]);

  const updateProgress = useCallback(
    (newProgress: UserProgress) => {
      setProgress(newProgress);
      saveUserProgressToStorage(newProgress);

      if (!user) return; // sem sessão ainda (não deveria acontecer pós-login, mas defensivo)

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        supabase
          .from('user_progress')
          .upsert({ user_id: user.id, data: newProgress, updated_at: new Date().toISOString() });
      }, SYNC_DEBOUNCE_MS);
    },
    [user],
  );

  return { progress, updateProgress };
}
```

- [ ] **Step 2: Verify (build)**

```bash
npx tsc --noEmit
npm run build
```

Expected: no new errors — hook isn't used by `App.tsx` yet (that's Task 9), so this only confirms the file compiles in isolation.

Known pre-existing issue, not caused by your changes: `npx tsc --noEmit` reports errors in `supabase/functions/*` (Deno files, unrelated tsconfig scoping gap). Confirm your one new file adds zero *additional* errors via a before/after comparison (`git stash` / `tsc` / count / `git stash pop` / `tsc` / count).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProgressSync.ts
git commit -m "feat(sync): hook de sincronização de progresso com Supabase"
git push origin main
```
