import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createFractionSchema } from "@/lib/validations";
import { createAuditEntry } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const fractions = await prisma.productFraction.findMany({
      where: { batchId: id },
      orderBy: { createdAt: "asc" },
      include: {
        equipment: { select: { id: true, name: true, type: true } },
        labResult: { select: { id: true, sampleNumber: true, productClassification: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(fractions);
  } catch (error) {
    console.error("Error fetching fractions:", error);
    return NextResponse.json({ error: "Error al obtener fracciones" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id: batchId } = await params;
    const body = await req.json();
    const data = createFractionSchema.parse(body);

    // Verify batch exists
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    const fraction = await prisma.productFraction.create({
      data: {
        ...data,
        batchId,
        createdById: session.userId,
      },
    });

    await createAuditEntry({
      userId: session.userId,
      userEmail: session.email,
      action: "CREATE",
      entity: "ProductFraction",
      entityId: fraction.id,
      batchId,
      changes: data as unknown as Record<string, unknown>,
    });

    return NextResponse.json(fraction, { status: 201 });
  } catch (error) {
    console.error("Error creating fraction:", error);
    return NextResponse.json({ error: "Error al crear fracción" }, { status: 500 });
  }
}
