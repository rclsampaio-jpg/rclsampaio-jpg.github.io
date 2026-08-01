/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';

// Real, server-enforced content editing: overrides live in the
// `site_content` table (supabase/migrations/0010_site_content.sql), read by
// every visitor (anon included, via RLS) and writable only by accounts with
// profiles.is_admin = true. This replaces the old CmsView pattern, which
// only ever wrote to localStorage and so never actually changed what real
// visitors saw — only what showed up in the editor's own browser.

interface SiteContentValue {
  get: <T = unknown>(key: string, fallback: T) => T;
  set: (key: string, value: unknown) => Promise<void>;
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
}

const SiteContentContext = createContext<SiteContentValue | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditModeState] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('site_content')
      .select('*')
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const map: Record<string, unknown> = {};
        for (const row of data as { key: string; value: unknown }[]) {
          map[row.key] = row.value;
        }
        setContent(map);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real admin identity check: profiles.is_admin, server-side, not the
  // client-side ADMIN_PASSPHRASE in App.tsx (which only gates the old
  // localStorage-only CMS).
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setIsAdmin(Boolean(data?.is_admin));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isAdmin) setEditModeState(false);
  }, [isAdmin]);

  const get = useCallback(
    <T,>(key: string, fallback: T): T => {
      return key in content ? (content[key] as T) : fallback;
    },
    [content]
  );

  const set = useCallback(
    async (key: string, value: unknown) => {
      if (!user) return;
      setContent((prev) => ({ ...prev, [key]: value }));
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
      if (error) {
        // Surface loudly — an admin editing content needs to know a save
        // failed (most likely RLS rejecting a non-admin, or offline).
        console.error('site_content upsert failed', error);
      }
    },
    [user]
  );

  const setEditMode = useCallback(
    (value: boolean) => {
      setEditModeState(isAdmin ? value : false);
    },
    [isAdmin]
  );

  return (
    <SiteContentContext.Provider value={{ get, set, isAdmin, editMode, setEditMode }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within a SiteContentProvider');
  return ctx;
}
