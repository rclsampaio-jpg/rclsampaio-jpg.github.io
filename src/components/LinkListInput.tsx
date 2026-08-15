/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, X } from 'lucide-react';

interface LinkListInputProps {
  links: string[];
  onChange: (links: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
}

// Campo de link genérico e expansível, usado em todo lugar que antes tinha
// um número fixo de campos de link (a Missão Diária tinha 3 fixos, um por
// promessa). Agora é sempre "quantos links ela quiser", com um "+" pra
// adicionar outro.
export default function LinkListInput({ links, onChange, placeholder, disabled, inputClassName }: LinkListInputProps) {
  const safeLinks = links.length > 0 ? links : [''];

  const handleChange = (index: number, value: string) => {
    const next = [...safeLinks];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...safeLinks, '']);
  };

  const handleRemove = (index: number) => {
    const next = safeLinks.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : ['']);
  };

  return (
    <div className="space-y-2">
      {safeLinks.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="url"
            value={link}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={placeholder}
            className={inputClassName || 'flex-1 text-xs bg-[#FAF8F5] dark:bg-ink border border-rose-100/10 focus:border-rosegold focus:outline-none focus:ring-1 focus:ring-rosegold rounded-xl p-3.5 text-slate-700 dark:text-ink-text transition-all duration-300 shadow-xs'}
          />
          {safeLinks.length > 1 && !disabled && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
              aria-label="Remover link"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 text-xs font-semibold text-rosegold-dark dark:text-rosegold-light hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar outro link
        </button>
      )}
    </div>
  );
}
