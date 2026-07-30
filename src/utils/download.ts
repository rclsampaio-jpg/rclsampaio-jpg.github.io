/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Forces an actual file download instead of navigating to/previewing the
// URL. Plain <a download> and window.open(url, '_blank') both hand control
// to whatever the browser/webview does with that file type — unreliable for
// PDFs, especially inside the iOS "Add to Home Screen" standalone app, which
// can open to a blank page or a viewer with no visible save option. Fetching
// the file as a blob and clicking a temporary object-URL anchor triggers the
// browser's real save-file flow regardless of viewer chrome.
export async function forceDownload(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
