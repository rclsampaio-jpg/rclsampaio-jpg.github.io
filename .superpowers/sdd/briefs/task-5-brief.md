### Task 5: Cliente Supabase + AuthContext no front-end

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/contexts/AuthContext.tsx`
- Modify: `package.json` (adicionar dependência)
- Modify/Create: `.env.local` (não commitado — só para dev local; ver `.gitignore`)

**Interfaces:**
- Consumes: `SUPABASE_URL=https://iedkwbborimdhphbzwhl.supabase.co`, `SUPABASE_ANON_KEY=sb_publishable_6skldo-YC1gPMPAUBZPDiQ_6sq5v9PI`.
- Produces: `supabase` (cliente exportado de `src/lib/supabase.ts`), `useAuth()` hook retornando `{ user, session, loading, signIn(email, password), signOut() }`. Consumido por `App.tsx`, `LoginView.tsx`, `SignupView.tsx`, `useProgressSync.ts` (tasks futuras).

- [ ] **Step 1: Instalar a dependência**

```bash
cd ~/Projetos/rclsampaio-jpg.github.io
npm install @supabase/supabase-js
```

Expected: `package.json` e `package-lock.json` atualizados, sem erros.

- [ ] **Step 2: Criar `.env.local` (dev local, não commitado)**

Confirmar que `.gitignore` já ignora `.env*` (checar `cat .gitignore`); se não ignorar, adicionar `.env.local` antes de criar o arquivo. Depois criar:

```bash
# .env.local — NÃO COMMITAR
VITE_SUPABASE_URL=https://iedkwbborimdhphbzwhl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_6skldo-YC1gPMPAUBZPDiQ_6sq5v9PI
```

- [ ] **Step 3: Criar o cliente Supabase**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Criar o AuthContext**

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? traduzErroLogin(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function traduzErroLogin(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
  return 'Não foi possível entrar. Tente novamente.';
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
```

- [ ] **Step 5: Verificar (build)**

```bash
npx tsc --noEmit
npm run build
```

Expected: ambos sem erros — os novos arquivos ainda não são importados por nada, então isso só confirma que compilam isoladamente.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.ts src/contexts/AuthContext.tsx package.json package-lock.json
git commit -m "feat(auth): cliente Supabase e AuthContext"
git push origin main
```

(`.env.local` não entra no commit — confirmar com `git status` que não aparece antes de dar `git add`.)
