/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Loader2 } from 'lucide-react';

interface DocumentPreviewModalProps {
  url: string;
  title: string;
  downloadLabel: string;
  closeLabel: string;
  onClose: () => void;
}

// Opening a PDF via window.open/target=_blank leaves the download affordance
// entirely up to whatever viewer chrome the browser happens to provide —
// which iOS Safari's standalone "Add to Home Screen" mode often doesn't show
// at all. Rendered as our own in-app viewer instead, with an explicit
// "Baixar" button that force-downloads via a blob (works regardless of
// native viewer chrome), so the download option is always there.
export default function DocumentPreviewModal({ url, title, downloadLabel, closeLabel, onClose }: DocumentPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = url.split('/').pop() || 'documento.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/70 flex flex-col">
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-[#2C221E] text-white shrink-0">
        <span className="text-xs font-sans font-bold uppercase tracking-wider truncate">{title}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rosegold hover:bg-[#A35D68] text-white text-[11px] font-sans font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {downloadLabel}
          </button>
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <iframe src={url} title={title} className="flex-1 w-full bg-white" />
    </div>,
    document.body
  );
}
