// components/documents/AgendarisActionPanel.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Send, RotateCcw, Bell, Loader2 } from "lucide-react";

interface DocProps { id: string; currentStatus: string; }

export function AgendarisActionPanel({ doc }: { doc: DocProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [mode, setMode] = useState<"idle" | "teruskan" | "kembalikan">("idle");

  const submitReview = async (reviewStatus: "DITERUSKAN" | "DIKEMBALIKAN") => {
    if (reviewStatus === "DIKEMBALIKAN" && !reviewNote.trim()) {
      toast.error("Harap isi catatan revisi untuk Staff.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus, reviewNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal.");
      toast.success(json.message ?? "Berhasil!");
      router.push("/dashboard/agendaris/inbox");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const notifyPickup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}/notify-pickup`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal.");
      toast.success("Notifikasi pengambilan berhasil dikirim ke Staff!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // Dokumen menunggu review
  if (doc.currentStatus === "MENUNGGU_REVIEW_AGENDARIS") {
    return (
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Tindakan Review</h3>

        {mode === "idle" && (
          <div className="flex gap-3">
            <button onClick={() => setMode("teruskan")} className="btn-success flex-1 justify-center">
              <Send className="w-4 h-4" /> Teruskan ke Direktur
            </button>
            <button onClick={() => setMode("kembalikan")} className="btn-danger flex-1 justify-center">
              <RotateCcw className="w-4 h-4" /> Kembalikan ke Staff
            </button>
          </div>
        )}

        {mode === "teruskan" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Dokumen akan diteruskan ke Direktur Utama untuk diambil keputusan.
            </p>
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder="Catatan untuk Direktur (opsional)..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setMode("idle")} className="btn-secondary flex-1 justify-center">Batal</button>
              <button
                onClick={() => submitReview("DITERUSKAN")}
                disabled={loading}
                className="btn-success flex-1 justify-center"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />...</> : <><Send className="w-4 h-4" /> Konfirmasi Teruskan</>}
              </button>
            </div>
          </div>
        )}

        {mode === "kembalikan" && (
          <div className="space-y-3">
            <p className="text-sm text-red-700 font-medium">
              Dokumen akan dikembalikan ke Staff untuk diperbaiki.
            </p>
            <textarea
              className="form-input resize-none border-red-300 focus:ring-red-400"
              rows={4}
              placeholder="Tuliskan catatan revisi yang jelas untuk Staff... (wajib)"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setMode("idle")} className="btn-secondary flex-1 justify-center">Batal</button>
              <button
                onClick={() => submitReview("DIKEMBALIKAN")}
                disabled={loading}
                className="btn-danger flex-1 justify-center"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />...</> : <><RotateCcw className="w-4 h-4" /> Kembalikan ke Staff</>}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Setelah keputusan direktur, notify staff
  if (doc.currentStatus === "KEPUTUSAN_DIREKTUR_SELESAI") {
    return (
      <div className="card p-5 bg-orange-50 border-orange-200 space-y-3">
        <h3 className="font-semibold text-orange-900">Hubungi Staff</h3>
        <p className="text-sm text-orange-700">
          Direktur telah memberikan keputusan. Beritahu Staff untuk mengambil surat fisik.
        </p>
        <button
          onClick={notifyPickup}
          disabled={loading}
          className="btn-primary bg-orange-600 hover:bg-orange-700 w-full justify-center"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
            : <><Bell className="w-4 h-4" /> Kirim Notifikasi ke Staff</>}
        </button>
      </div>
    );
  }

  return null;
}
