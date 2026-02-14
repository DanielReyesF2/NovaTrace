import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createReadingSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const readings = await prisma.reading.findMany({
    where: { batchId: id },
    orderBy: { timestamp: "asc" },
  });
  return NextResponse.json(readings);
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
  const data = createReadingSchema.parse(body);

  const { timestamp, ...rest } = data;
  const reading = await prisma.reading.create({
    data: {
      batchId: id,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      ...rest,
    },
  });

  // Update batch maxReactorTemp if higher
  if (data.reactorTemp) {
    const batch = await prisma.batch.findUnique({ where: { id } });
    if (batch && (!batch.maxReactorTemp || data.reactorTemp > batch.maxReactorTemp)) {
      await prisma.batch.update({
        where: { id },
        data: { maxReactorTemp: data.reactorTemp },
      });
    }
  }

  return NextResponse.json(reading, { status: 201 });
}
