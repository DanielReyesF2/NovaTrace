import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLabResultSchema } from "@/lib/validations";

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
    },
  });

  return NextResponse.json(result, { status: 201 });
}
