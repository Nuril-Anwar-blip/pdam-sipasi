// app/api/documents/[id]/decision/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, successResponse, errorResponse, getClientIp } from "@/lib/auth-helpers";
import { createAuditLog, createStatusTimeline } from "@/lib/audit";
import { directorDecisionSchema } from "@/lib/validations";

type Params = { params: { id: string } };

// POST /api/documents/[id]/decision
// Direktur memberikan keputusan
export async function POST(req: NextRequest, { params }: Params) {
  return requireAuth(req, async (user, request) => {
    if (user.role !== "DIREKTUR") {
      return errorResponse("Hanya Direktur Utama yang dapat memberikan keputusan.", 403);
    }

    try {
      const body = await request.json();
      const parsed = directorDecisionSchema.safeParse(body);

      if (!parsed.success) {
        return errorResponse("Validasi gagal.", 422);
      }

      const { decisionType, decisionNote } = parsed.data;

      const doc = await prisma.document.findUnique({ where: { id: params.id } });
      if (!doc) return errorResponse("Dokumen tidak ditemukan.", 404);

      const validStatuses = ["MENUNGGU_KEPUTUSAN_DIREKTUR", "DIPROSES_DIREKTUR"];
      if (!validStatuses.includes(doc.currentStatus)) {
        return errorResponse(
          `Dokumen tidak dalam tahap keputusan Direktur. Status: ${doc.currentStatus}`,
          400
        );
      }

      const prevStatus = doc.currentStatus;

      // Semua keputusan Direktur → kembali ke Agendaris
      const [decision, updatedDoc] = await prisma.$transaction([
        prisma.directorDecision.create({
          data: {
            documentId: doc.id,
            directorId: user.id,
            decisionType,
            decisionNote,
          },
        }),
        prisma.document.update({
          where: { id: doc.id },
          data: {
            currentStatus: "KEPUTUSAN_DIREKTUR_SELESAI",
            currentHolder: "AGENDARIS",
          },
        }),
      ]);

      const decisionLabels: Record<string, string> = {
        DISETUJUI: "Disetujui",
        DITOLAK: "Ditolak",
        REVISI: "Perlu Revisi",
        DISPOSISI: "Disposisi",
      };

      await createStatusTimeline({
        documentId: doc.id,
        fromStatus: prevStatus,
        toStatus: "KEPUTUSAN_DIREKTUR_SELESAI",
        changedBy: user.id,
        notes: `Direktur memberikan keputusan: ${decisionLabels[decisionType]}. ${decisionNote ?? ""}`,
      });

      await createAuditLog({
        userId: user.id,
        documentId: doc.id,
        action: `DIRECTOR_DECISION_${decisionType}`,
        description: `Direktur memberi keputusan ${decisionType} untuk dokumen ${doc.nomorSurat}`,
        metadata: { decisionType, decisionNote },
        ipAddress: getClientIp(request),
      });

      return successResponse(
        { decision, document: updatedDoc },
        `Keputusan "${decisionLabels[decisionType]}" berhasil disimpan dan dokumen dikembalikan ke Agendaris.`
      );
    } catch (error) {
      console.error("[POST /api/documents/[id]/decision]", error);
      return errorResponse("Gagal menyimpan keputusan.", 500);
    }
  });
}
