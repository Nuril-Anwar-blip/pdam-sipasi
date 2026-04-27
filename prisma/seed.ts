// prisma/seed.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 12);

  // Hapus data lama
  await prisma.auditLog.deleteMany();
  await prisma.statusTimeline.deleteMany();
  await prisma.archive.deleteMany();
  await prisma.handoverLog.deleteMany();
  await prisma.directorDecision.deleteMany();
  await prisma.documentReview.deleteMany();
  await prisma.documentFile.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@pdam.go.id",
      passwordHash: hash("Admin@12345"),
      role: "ADMIN",
      divisi: "IT / Sistem Informasi",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "staff@pdam.go.id",
      passwordHash: hash("Staff@12345"),
      role: "STAFF",
      divisi: "Administrasi Umum",
    },
  });

  const agendaris = await prisma.user.create({
    data: {
      name: "Sari Dewi",
      email: "agendaris@pdam.go.id",
      passwordHash: hash("Agendaris@12345"),
      role: "AGENDARIS",
      divisi: "Sekretariat",
    },
  });

  const direktur = await prisma.user.create({
    data: {
      name: "Ir. H. Ahmad Subagyo",
      email: "direktur@pdam.go.id",
      passwordHash: hash("Direktur@12345"),
      role: "DIREKTUR",
      divisi: "Direksi",
    },
  });

  console.log("✅ Users created:", {
    admin: admin.email,
    staff: staff1.email,
    agendaris: agendaris.email,
    direktur: direktur.email,
  });

  const doc = await prisma.document.create({
    data: {
      nomorSurat: "001/ADM/PDAM/2025",
      perihal: "Permohonan Pengadaan Peralatan Kantor",
      deskripsi: "Surat permohonan pengadaan komputer, printer, dan ATK untuk kebutuhan operasional Q1 2025.",
      tujuan: "Direktur Utama PDAM Kabupaten Bandung",
      tanggalSurat: new Date("2025-01-15"),
      currentStatus: "DRAFT",
      createdById: staff1.id,
      currentHolder: staff1.id,
    },
  });

  await prisma.statusTimeline.create({
    data: {
      documentId: doc.id,
      toStatus: "DRAFT",
      changedBy: staff1.id,
      notes: "Dokumen dibuat oleh Staff",
    },
  });

  console.log("✅ Sample document created:", doc.nomorSurat);
  console.log("\n📋 Default Credentials:");
  console.log("  Admin     → admin@pdam.go.id     / Admin@12345");
  console.log("  Staff     → staff@pdam.go.id     / Staff@12345");
  console.log("  Agendaris → agendaris@pdam.go.id / Agendaris@12345");
  console.log("  Direktur  → direktur@pdam.go.id  / Direktur@12345");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());