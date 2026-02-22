import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createBatchSchema } from "@/lib/validations";
import { generateBatchCode } from "@/lib/utils";
import { calculateGHG } from "@/lib/ghg";
import { createAuditEntry } from "@/lib/audit";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { date: "desc" },
      include: {
        labResults: { select: { id: true, labName: true, verdict: true } },
        certificates: { select: { id: true, code: true } },
        _count: { select: { readings: true, events: true, photos: true } },
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ error: "Error al obtener lotes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const data = createBatchSchema.parse(body);

    // Generate batch code: {Year}/{Month}/{Reactor}/{Feedstock}/{Seq}
    const today = new Date();
    const { FEEDSTOCK_CODES } = await import("@/lib/utils");
    const yearLetter = { 2024: "A", 2025: "B", 2026: "C", 2027: "D" }[today.getFullYear()] ?? "X";
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const feedCode = FEEDSTOCK_CODES[data.feedstockType] ?? "GEN";
    const prefix = `${yearLetter}/${month}/1/${feedCode}/`;
    const existingThisMonth = await prisma.batch.count({
      where: { code: { startsWith: prefix.slice(0, -1) } },
    });
    const code = generateBatchCode(today, data.feedstockType, existingThisMonth + 1);

    const batch = await prisma.batch.create({
      data: {
        code,
        date: today,
        status: "ACTIVE",
        ...data,
      },
    });

    await createAuditEntry({
      userId: session.userId,
      userEmail: session.email,
      action: "CREATE",
      entity: "Batch",
      entityId: batch.id,
      batchId: batch.id,
      changes: data as unknown as Record<string, unknown>,
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json({ error: "Error al crear lote" }, { status: 500 });
  }
}
