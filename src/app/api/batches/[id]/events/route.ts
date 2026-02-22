import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations";
import { createAuditEntry } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const events = await prisma.processEvent.findMany({
    where: { batchId: id },
    orderBy: { timestamp: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role === "VIEWER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const data = createEventSchema.parse(body);

  const event = await prisma.processEvent.create({
    data: {
      batchId: id,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      type: data.type,
      detail: data.detail,
      notes: data.notes,
      createdById: session.userId,
    },
  });

  await createAuditEntry({
    userId: session.userId,
    userEmail: session.email,
    action: "CREATE",
    entity: "ProcessEvent",
    entityId: event.id,
    batchId: id,
  });

  return NextResponse.json(event, { status: 201 });
}
