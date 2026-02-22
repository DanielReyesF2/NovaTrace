import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createPhotoSchema } from "@/lib/validations";
import { createAuditEntry } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photos = await prisma.photo.findMany({
    where: { batchId: id },
    orderBy: { takenAt: "asc" },
  });
  return NextResponse.json(photos);
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

    const { id } = await params;

    // Verify batch exists
    const batch = await prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const data = createPhotoSchema.parse(body);

    const { takenAt, ...rest } = data;
    const photo = await prisma.photo.create({
      data: {
        batchId: id,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
        createdById: session.userId,
        ...rest,
      },
    });

    await createAuditEntry({
      userId: session.userId,
      userEmail: session.email,
      action: "CREATE",
      entity: "Photo",
      entityId: photo.id,
      batchId: id,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json({ error: "Error al crear foto" }, { status: 500 });
  }
}
