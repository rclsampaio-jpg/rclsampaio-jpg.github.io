/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pencil, X } from 'lucide-react';
import { useSiteContent } from '../../lib/siteContent';

// Small floating pill, bottom-right, visible only to a real admin
// (profiles.is_admin server-side check — see src/lib/siteContent.tsx),
// independent of the old client-side ADMIN_PASSPHRASE CMS gate. Toggles
// whether EditableText/EditableImage show their inline-edit affordances.
export default function EditModeToggle() {
  const { isAdmin, editMode, setEditMode } = useSiteContent();

  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => setEditMode(!editMode)}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-lg transition cursor-pointer ${
        editMode
          ? 'bg-rosegold text-white hover:bg-[#A35D68]'
          : 'bg-white dark:bg-ink-raised text-slate-600 dark:text-ink-text border border-rose-100/60 dark:border-ink-hairline hover:border-rosegold/50'
      }`}
    >
      {editMode ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
      {editMode ? 'Sair da edição' : 'Modo de edição'}
    </button>
  );
}
