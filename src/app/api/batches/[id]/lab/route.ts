import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLabResultSchema } from "@/lib/validations";
import { createAuditEntry } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const results = await prisma.labResult.findMany({
    where: { batchId: id },
    orderBy: { reportDate: "desc" },
  });
  return NextResponse.json(results);
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
  const data = createLabResultSchema.parse(body);

  const result = await prisma.labResult.create({
    data: {
      batchId: id,
      ...data,
      reportDate: new Date(data.reportDate),
      createdById: session.userId,
    },
  });

  await createAuditEntry({
    userId: session.userId,
    userEmail: session.email,
    action: "CREATE",
    entity: "LabResult",
    entityId: result.id,
    batchId: id,
  });

  return NextResponse.json(result, { status: 201 });
}
