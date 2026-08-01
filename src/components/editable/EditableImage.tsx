/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MouseEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { useSiteContent } from '../../lib/siteContent';

interface EditableImageProps {
  contentKey: string;
  fallback: string;
  alt: string;
  className?: string;
}

// Editable image tied to a `site_content` row. URL-paste only for v1 (no
// file upload infra) — window.prompt is a deliberate simplification, not
// an oversight; see the avatars storage bucket (0009) if real upload is
// wanted later. Renders exactly the fallback image for every normal
// visitor.
export default function EditableImage({ contentKey, fallback, alt, className }: EditableImageProps) {
  const { get, set, isAdmin, editMode } = useSiteContent();
  const src = get<string>(contentKey, fallback);

  if (!isAdmin || !editMode) {
    return <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />;
  }

  const handleReplace = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = window.prompt('Cole o URL da nova imagem:', src);
    if (next && next.trim() && next.trim() !== src) {
      await set(contentKey, next.trim());
    }
  };

  return (
    <div className="relative group/editable-img w-full h-full">
      <img src={src} alt={alt} className={className} referrerPolicy="no-referrer" />
      <button
        type="button"
        onClick={handleReplace}
        className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 group-hover/editable-img:bg-black/50 opacity-0 group-hover/editable-img:opacity-100 transition-all text-white text-xs font-sans font-bold uppercase tracking-wider"
      >
        <ImagePlus className="h-4 w-4" />
        Trocar imagem
      </button>
    </div>
  );
}
