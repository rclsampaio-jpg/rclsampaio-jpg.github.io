/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CheckCircle2, TrendingUp, MessageCircle, Compass, BookOpen } from 'lucide-react';
import { Language, UserProgress } from '../types';
import DashboardTab from './professional/DashboardTab';
import CheckinTab from './professional/CheckinTab';
import MensagensTab from './professional/MensagensTab';
import DiagnosticoTab from './professional/DiagnosticoTab';
import ReferenciaTab from './professional/ReferenciaTab';

interface ProfessionalAreaViewProps {
  progress: UserProgress;
  lang: Language;
  onUpdateProgress: (progress: UserProgress) => void;
  onGoToLibrary: () => void;
}

type Section = 'checkin' | 'dashboard' | 'mensagens' | 'diagnostico' | 'referencia';

export default function ProfessionalAreaView({ progress, onUpdateProgress, onGoToLibrary }: ProfessionalAreaViewProps) {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const diagnostic = progress.professionalDiagnostic;
  const gargalosAtuais = diagnostic?.estruturaRespostas?.gargalo ?? [];
  const nichoAtual = diagnostic?.nicho || '[seu nicho]';
  const tomAtual = diagnostic?.vozRespostas?.tom?.join(', ') || '[seu tom de voz]';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <p className="text-[11px] font-sans tracking-[0.2em] text-rosegold uppercase font-bold">
          Área da Profissional
        </p>
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-800 dark:text-ink-text">
          Destrave
        </h1>
        <p className="text-sm text-slate-500 dark:text-ink-muted max-w-md mx-auto">
          Conteúdo estratégico que converte seguidores em clientes. Sem enrolação, sem aula, direto ao ponto.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {([
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'checkin', label: 'Check-in do Dia', icon: CheckCircle2 },
          { id: 'mensagens', label: 'Mensagens', icon: MessageCircle },
          { id: 'diagnostico', label: 'Diagnóstico', icon: Compass },
          { id: 'referencia', label: 'Referência', icon: BookOpen }
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSection === id
                ? 'bg-rosegold text-white shadow-sm shadow-rosegold/25 dark:bg-transparent dark:border dark:border-rosegold-light dark:text-rosegold-light'
                : 'text-slate-500 dark:text-ink-muted hover:bg-rose-50/50 dark:hover:bg-rosegold-light/10'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === 'dashboard' && (
        <DashboardTab progress={progress} gargalosAtuais={gargalosAtuais} onNavigate={setActiveSection} />
      )}
      {activeSection === 'checkin' && (
        <CheckinTab progress={progress} onUpdateProgress={onUpdateProgress} />
      )}
      {activeSection === 'mensagens' && (
        <MensagensTab nichoAtual={nichoAtual} tomAtual={tomAtual} gargalosAtuais={gargalosAtuais} />
      )}
      {activeSection === 'diagnostico' && (
        <DiagnosticoTab progress={progress} onUpdateProgress={onUpdateProgress} />
      )}
      {activeSection === 'referencia' && (
        <ReferenciaTab
          nichoAtual={nichoAtual}
          tomAtual={tomAtual}
          gargalosAtuais={gargalosAtuais}
          onGoToLibrary={onGoToLibrary}
        />
      )}
    </div>
  );
}
