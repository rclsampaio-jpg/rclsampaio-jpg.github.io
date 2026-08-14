// src/components/AdminUsersPanel.tsx
import { useEffect, useState, useCallback } from 'react';
import { Users, Ban, RotateCcw, Trash2, Award, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InviteAdminPanel from './auth/InviteAdminPanel';
import ProfessionalAccessAdminPanel from './auth/ProfessionalAccessAdminPanel';

interface AdminUser {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  bannedUntil: string | null;
  isAdmin: boolean;
  displayName: string | null;
  currentDay: number;
  completedDaysCount: number;
  currentStreak: number;
  progressUpdatedAt: string | null;
}

type ActionState = { userId: string; action: string } | null;

export default function AdminUsersPanel() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<ActionState>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const callAdminApi = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch(`${supabaseUrl}/functions/v1/admin-manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? 'Erro na requisição.');
    return json;
  }, [session, supabaseUrl, supabaseAnonKey]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await callAdminApi({ action: 'list' });
      setUsers(json.users ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }, [callAdminApi]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const runAction = async (userId: string, action: string, extraConfirm?: string) => {
    if (extraConfirm && !window.confirm(extraConfirm)) return;
    setActing({ userId, action });
    setError(null);
    try {
      await callAdminApi({ action, userId });
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ação falhou.');
    } finally {
      setActing(null);
      setConfirmingDelete(null);
    }
  };

  const isBanned = (u: AdminUser) => !!u.bannedUntil && new Date(u.bannedUntil) > new Date();

  return (
    <div className="space-y-6">
      <InviteAdminPanel />
      <ProfessionalAccessAdminPanel />
      <div className="bg-white dark:bg-ink-raised rounded-2xl border border-rose-100/25 dark:border-rosegold/10 p-6 space-y-6">
      <div className="border-b border-rose-100/10 pb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
            <Users className="h-5 w-5 text-rosegold" /> Alunas & Contas
          </h1>
          <p className="text-xs text-slate-400 dark:text-ink-muted">
            Gestão real de contas: bloquear, resetar progresso, premiar dias ou excluir.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rosegold hover:text-[#A35D68] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      {loading && users.length === 0 && (
        <p className="text-xs text-slate-400">Carregando contas...</p>
      )}

      {!loading && users.length === 0 && !error && (
        <p className="text-xs text-slate-400">Nenhuma conta encontrada.</p>
      )}

      <div className="divide-y divide-rose-100/15">
        {users.map((u) => {
          const banned = isBanned(u);
          const busy = (action: string) => acting?.userId === u.id && acting.action === action;
          return (
            <div key={u.id} className="py-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rosegold/10 text-rosegold flex items-center justify-center font-bold text-xs shrink-0">
                    {(u.displayName || u.email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      {u.displayName || u.email}
                      {u.isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-rosegold" />}
                      {banned && (
                        <span className="text-[9px] font-extrabold uppercase text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Bloqueada
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">{u.email}</span>
                    <span className="text-[10px] text-slate-400">
                      Dia {u.currentDay} · {u.completedDaysCount} concluídos · streak {u.currentStreak}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => runAction(u.id, 'awardDay', `Marcar o dia ${u.currentDay} como concluído para ${u.email}?`)}
                    disabled={!!acting}
                    title="Premiar: avançar um dia de progresso"
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 hover:text-emerald-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Award className="h-3.5 w-3.5" /> {busy('awardDay') ? '...' : 'Premiar dia'}
                  </button>

                  <button
                    onClick={() => runAction(u.id, banned ? 'unblock' : 'block', banned ? undefined : `Bloquear o acesso de ${u.email}?`)}
                    disabled={!!acting}
                    title={banned ? 'Desbloquear acesso' : 'Bloquear acesso'}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 hover:text-amber-700 disabled:opacity-40 cursor-pointer"
                  >
                    <Ban className="h-3.5 w-3.5" /> {busy(banned ? 'unblock' : 'block') ? '...' : banned ? 'Desbloquear' : 'Bloquear'}
                  </button>

                  <button
                    onClick={() => runAction(u.id, 'resetProgress', `Resetar todo o progresso de ${u.email}? Isso zera dias, streak e reflexões.`)}
                    disabled={!!acting}
                    title="Resetar progresso"
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> {busy('resetProgress') ? '...' : 'Resetar'}
                  </button>

                  {confirmingDelete === u.id ? (
                    <button
                      onClick={() => runAction(u.id, 'deleteAccount')}
                      disabled={!!acting}
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-white bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {busy('deleteAccount') ? 'Excluindo...' : 'Confirmar exclusão'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmingDelete(u.id)}
                      disabled={!!acting}
                      title="Excluir conta"
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-rose-500 hover:text-rose-600 disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
