"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard tidak tersedia (mis. non-HTTPS); pengguna bisa salin manual.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-lg font-bold tracking-[0.3em] text-teal-700">
        {code}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}
