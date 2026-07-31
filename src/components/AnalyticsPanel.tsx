// src/components/AnalyticsPanel.tsx
import { useEffect, useState, useCallback } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AssetStat {
  mediaType: string;
  assetId: string;
  count: number;
  uniqueUsers: number;
  lastEventAt: string;
}

interface UserStat {
  userId: string;
  email: string;
  count: number;
  lastEventAt: string;
}

interface AnalyticsData {
  totals: { totalEvents: number; uniqueUsers: number; uniqueAssets: number };
  byAsset: AssetStat[];
  byUser: UserStat[];
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  daily_audio: 'Áudio do dia',
  library_audio: 'Áudio da biblioteca',
  library_video: 'Vídeo da biblioteca',
  library_pdf: 'PDF da biblioteca',
  weekly_video: 'Vídeo semanal',
};

export default function AnalyticsPanel() {
  const { session } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Erro na requisição.');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as métricas.');
    } finally {
      setLoading(false);
    }
  }, [session, supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-6">
      <div className="border-b border-rose-100/10 pb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-white uppercase flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-rosegold" /> Métricas & Insights
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Consumo real de áudios, vídeos e PDFs desde que o registro de eventos entrou no ar.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rosegold hover:text-[#A35D68] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      {loading && !data && (
        <p className="text-xs text-slate-400">Carregando métricas...</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Eventos registrados</span>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{data.totals.totalEvents}</div>
            </div>
            <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Alunas que consumiram algo</span>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{data.totals.uniqueUsers}</div>
            </div>
            <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-5 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Conteúdos diferentes tocados</span>
              <div className="text-2xl font-black text-slate-800 dark:text-white">{data.totals.uniqueAssets}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white border-b border-rose-100/10 pb-2">
              Conteúdos mais consumidos
            </h3>
            {data.byAsset.length === 0 ? (
              <p className="text-xs text-slate-400">Ainda sem eventos registrados.</p>
            ) : (
              <div className="divide-y divide-rose-100/10">
                {data.byAsset.slice(0, 20).map((a) => (
                  <div key={`${a.mediaType}:${a.assetId}`} className="py-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{a.assetId}</span>
                      <span className="text-[10px] text-slate-400 block">{MEDIA_TYPE_LABELS[a.mediaType] ?? a.mediaType}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-rosegold">{a.count} plays</div>
                      <div className="text-[10px] text-slate-400">{a.uniqueUsers} alunas</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#2C221E] border border-rose-100/20 dark:border-rosegold/10 p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white border-b border-rose-100/10 pb-2">
              Alunas mais engajadas
            </h3>
            {data.byUser.length === 0 ? (
              <p className="text-xs text-slate-400">Ainda sem eventos registrados.</p>
            ) : (
              <div className="divide-y divide-rose-100/10">
                {data.byUser.slice(0, 20).map((u) => (
                  <div key={u.userId} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{u.email}</span>
                    <div className="text-xs font-bold text-rosegold">{u.count} eventos</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
