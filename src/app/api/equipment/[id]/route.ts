import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateEquipmentSchema } from "@/lib/validations";
import { createAuditEntry, diffRecords } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        readings: { take: 10, orderBy: { timestamp: "desc" } },
        fractions: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json({ error: "Error al obtener equipo" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateEquipmentSchema.parse(body);

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });
    }

    const { specs, parentEquipmentId, ...rest } = data;
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        ...rest,
        calibrationDate: data.calibrationDate ? new Date(data.calibrationDate) : undefined,
        calibrationExpiry: data.calibrationExpiry ? new Date(data.calibrationExpiry) : undefined,
        specs: specs ? (JSON.parse(JSON.stringify(specs)) as Prisma.InputJsonValue) : undefined,
        parentEquipmentId: parentEquipmentId ?? undefined,
      } satisfies Prisma.EquipmentUncheckedUpdateInput,
    });

    const changes = diffRecords(
      existing as unknown as Record<string, unknown>,
      equipment as unknown as Record<string, unknown>
    );
    if (changes) {
      await createAuditEntry({
        userId: session.userId,
        userEmail: session.email,
        action: "UPDATE",
        entity: "Equipment",
        entityId: id,
        changes,
      });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json({ error: "Error al actualizar equipo" }, { status: 500 });
  }
}
