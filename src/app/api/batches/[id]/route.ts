import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateBatchSchema } from "@/lib/validations";
import { calculateGHG } from "@/lib/ghg";
import { createAuditEntry, diffRecords } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        readings: { orderBy: { timestamp: "asc" } },
        events: { orderBy: { timestamp: "asc" } },
        photos: { orderBy: { takenAt: "asc" } },
        labResults: true,
        certificates: true,
        productFractions: {
          orderBy: { createdAt: "asc" },
          include: {
            equipment: { select: { id: true, name: true, type: true } },
            labResult: { select: { id: true, sampleNumber: true, productClassification: true } },
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json({ error: "Error al obtener lote" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateBatchSchema.parse(body);

    // Fetch before update for audit diff
    const existing = await prisma.batch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    // If completing, calculate GHG impact
    let ghgData = {};
    if (data.status === "COMPLETED" && data.oilOutput != null) {
      const ghg = calculateGHG({
        feedstockKg: existing.feedstockWeight,
        contaminationPct: existing.contaminationPct ?? 0,
        oilLiters: data.oilOutput,
        dieselConsumedL: data.dieselConsumedL,
        durationHours: data.durationMinutes ? data.durationMinutes / 60 : undefined,
      });
      ghgData = {
        co2Baseline: ghg.baselineTotal,
        co2Project: ghg.projectTotal,
        co2Avoided: ghg.avoided,
      };
    }

    const batch = await prisma.batch.update({
      where: { id },
      data: { ...data, ...ghgData },
    });

    const changes = diffRecords(
      existing as unknown as Record<string, unknown>,
      batch as unknown as Record<string, unknown>
    );
    if (changes) {
      await createAuditEntry({
        userId: session.userId,
        userEmail: session.email,
        action: "UPDATE",
        entity: "Batch",
        entityId: id,
        batchId: id,
        changes,
      });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json({ error: "Error al actualizar lote" }, { status: 500 });
  }
}
