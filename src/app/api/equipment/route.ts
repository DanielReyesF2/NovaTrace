import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createEquipmentSchema } from "@/lib/validations";
import { createAuditEntry } from "@/lib/audit";

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { name: "asc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { readings: true, fractions: true } },
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json({ error: "Error al obtener equipos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const data = createEquipmentSchema.parse(body);

    const { specs, parentEquipmentId, ...rest } = data;
    const equipment = await prisma.equipment.create({
      data: {
        ...rest,
        calibrationDate: data.calibrationDate ? new Date(data.calibrationDate) : undefined,
        calibrationExpiry: data.calibrationExpiry ? new Date(data.calibrationExpiry) : undefined,
        specs: specs ? (JSON.parse(JSON.stringify(specs)) as Prisma.InputJsonValue) : undefined,
        parentEquipmentId: parentEquipmentId ?? undefined,
        createdById: session.userId,
      } satisfies Prisma.EquipmentUncheckedCreateInput,
    });

    await createAuditEntry({
      userId: session.userId,
      userEmail: session.email,
      action: "CREATE",
      entity: "Equipment",
      entityId: equipment.id,
      changes: data as unknown as Record<string, unknown>,
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json({ error: "Error al crear equipo" }, { status: 500 });
  }
}
