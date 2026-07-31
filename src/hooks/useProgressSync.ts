import { useState, useEffect, useRef, useCallback } from 'react';
import { UserProgress } from '../types';
import { saveUserProgressToStorage } from '../data/templateData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SYNC_DEBOUNCE_MS = 2000;
const OWNER_KEY = 'renaser_progress_owner';
const PROGRESS_KEY = 'renaser_user_progress';

function getStoredOwner(): string | null {
  return localStorage.getItem(OWNER_KEY);
}

function setStoredOwner(userId: string): void {
  localStorage.setItem(OWNER_KEY, userId);
}

/** Clears the per-user progress cache so nothing leaks to the next person
 * who opens the app on this device (called on sign-out). */
export function clearLocalProgressCache(): void {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(OWNER_KEY);
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export function useProgressSync(initialProgress: UserProgress) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWrite = useRef<{ userId: string; data: UserProgress } | null>(null);
  const loadedForUserId = useRef<string | null>(null);

  // Ao logar: busca progresso da nuvem; se nuvem vazia e há progresso local
  // (localStorage) pertencente a este mesmo usuário, sobe o local uma vez
  // (migração de quem já usava o app). Reexecuta sempre que o user.id muda,
  // para não reaproveitar dados de uma conta anterior no mesmo dispositivo.
  useEffect(() => {
    if (!user || loadedForUserId.current === user.id) return;
    loadedForUserId.current = user.id;

    (async () => {
      const { data: cloudRow, error } = await supabase
        .from('user_progress')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cloudRow?.data) {
        // Cloud has real data for this user: always trust it.
        const cloudProgress = cloudRow.data as UserProgress;
        setProgress(cloudProgress);
        saveUserProgressToStorage(cloudProgress);
        setStoredOwner(user.id);
        return;
      }

      if (error) {
        // Read failed (network hiccup / RLS issue) — this is NOT the same as
        // "genuinely new user". Don't overwrite anything; leave local state
        // as-is and don't upload local progress on unknown/failed state.
        return;
      }

      // Read succeeded and there is genuinely no row for this user yet.
      const storedOwner = getStoredOwner();
      if (storedOwner === null || storedOwner === user.id) {
        // Either the first-ever login on this device (pre-dating
        // multi-account awareness) or local data already confirmed to
        // belong to this same user — safe to migrate it up.
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          data: initialProgress,
          updated_at: new Date().toISOString(),
        });
        setStoredOwner(user.id);
      } else {
        // Local data belongs to a different user (shared device). Do NOT
        // upload a stranger's local progress — start fresh for this user.
        const freshProgress: UserProgress = { ...initialProgress };
        setProgress(freshProgress);
        saveUserProgressToStorage(freshProgress);
        setStoredOwner(user.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const flushPendingWrite = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingWrite.current) {
      const { userId, data } = pendingWrite.current;
      pendingWrite.current = null;
      setSyncStatus('syncing');
      supabase
        .from('user_progress')
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() })
        .then(({ error }) => setSyncStatus(error ? 'error' : 'synced'));
    }
  }, []);

  // Flush any pending debounced write immediately when the tab/PWA is being
  // hidden or closed, so edits made within the last 2s aren't lost (I5).
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingWrite();
      }
    };
    const handleBeforeUnload = () => {
      flushPendingWrite();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushPendingWrite]);

  const updateProgress = useCallback(
    (newProgress: UserProgress) => {
      setProgress(newProgress);
      saveUserProgressToStorage(newProgress);

      if (!user) return; // sem sessão ainda (não deveria acontecer pós-login, mas defensivo)

      setStoredOwner(user.id);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      pendingWrite.current = { userId: user.id, data: newProgress };
      setSyncStatus('syncing');
      debounceTimer.current = setTimeout(() => {
        pendingWrite.current = null;
        supabase
          .from('user_progress')
          .upsert({ user_id: user.id, data: newProgress, updated_at: new Date().toISOString() })
          .then(({ error }) => setSyncStatus(error ? 'error' : 'synced'));
      }, SYNC_DEBOUNCE_MS);
    },
    [user],
  );

  return { progress, updateProgress, syncStatus };
}
