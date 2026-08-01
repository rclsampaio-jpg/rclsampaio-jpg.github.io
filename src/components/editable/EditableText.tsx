/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { Pencil } from 'lucide-react';
import { useSiteContent } from '../../lib/siteContent';

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  className?: string;
}

// Inline-editable text tied to a `site_content` row. Renders exactly the
// fallback/default for every normal visitor (zero visual change) — the
// pencil affordance and inline editor only ever appear for a real admin
// (profiles.is_admin, see src/lib/siteContent.tsx) with edit mode on.
export default function EditableText({ contentKey, fallback, as = 'span', className }: EditableTextProps) {
  const { get, set, isAdmin, editMode } = useSiteContent();
  const value = get<string>(contentKey, fallback);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const Tag = as;

  if (!isAdmin || !editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (isEditing) {
    const commit = async () => {
      setIsEditing(false);
      if (draft !== value) await set(contentKey, draft);
    };
    const cancel = () => {
      setDraft(value);
      setIsEditing(false);
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    };
    return (
      <textarea
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        rows={1}
        className={`${className || ''} bg-rose-50 dark:bg-ink-raised border border-rosegold/50 rounded px-1.5 py-0.5 outline-none resize-y w-full`}
      />
    );
  }

  const startEditing = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <Tag className={`${className || ''} group/editable relative inline-flex items-center gap-1.5 cursor-pointer`}>
      <span onClick={startEditing}>{value}</span>
      <button
        type="button"
        onClick={startEditing}
        className="opacity-0 group-hover/editable:opacity-70 hover:!opacity-100 transition-opacity shrink-0"
        aria-label="Editar texto"
        title="Editar texto"
      >
        <Pencil className="h-3.5 w-3.5 text-[#D4AF37]" />
      </button>
    </Tag>
  );
}
