import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateFractionSchema } from "@/lib/validations";
import { createAuditEntry, diffRecords } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fractionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id: batchId, fractionId } = await params;
    const body = await req.json();
    const data = updateFractionSchema.parse(body);

    const existing = await prisma.productFraction.findFirst({
      where: { id: fractionId, batchId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Fracción no encontrada" }, { status: 404 });
    }

    const fraction = await prisma.productFraction.update({
      where: { id: fractionId },
      data,
    });

    const changes = diffRecords(
      existing as unknown as Record<string, unknown>,
      fraction as unknown as Record<string, unknown>
    );
    if (changes) {
      await createAuditEntry({
        userId: session.userId,
        userEmail: session.email,
        action: "UPDATE",
        entity: "ProductFraction",
        entityId: fractionId,
        batchId,
        changes,
      });
    }

    return NextResponse.json(fraction);
  } catch (error) {
    console.error("Error updating fraction:", error);
    return NextResponse.json({ error: "Error al actualizar fracción" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fractionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id: batchId, fractionId } = await params;

    const existing = await prisma.productFraction.findFirst({
      where: { id: fractionId, batchId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Fracción no encontrada" }, { status: 404 });
    }

    await prisma.productFraction.delete({ where: { id: fractionId } });

    await createAuditEntry({
      userId: session.userId,
      userEmail: session.email,
      action: "DELETE",
      entity: "ProductFraction",
      entityId: fractionId,
      batchId,
      changes: existing as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fraction:", error);
    return NextResponse.json({ error: "Error al eliminar fracción" }, { status: 500 });
  }
}
