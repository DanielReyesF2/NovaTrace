import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createBatchSchema } from "@/lib/validations";
import { generateBatchCode } from "@/lib/utils";
import { calculateGHG } from "@/lib/ghg";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { date: "desc" },
      include: {
        labResults: { select: { id: true, labName: true, verdict: true } },
        certificates: { select: { id: true, code: true } },
        _count: { select: { readings: true, events: true, photos: true } },
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ error: "Error al obtener lotes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === "VIEWER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const data = createBatchSchema.parse(body);

    // Generate batch code
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const existingToday = await prisma.batch.count({
      where: {
        code: { startsWith: `ECO-DY500-${todayStr.replace(/-/g, "")}` },
      },
    });
    const code = generateBatchCode(today, existingToday + 1);

    const batch = await prisma.batch.create({
      data: {
        code,
        date: today,
        status: "ACTIVE",
        ...data,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json({ error: "Error al crear lote" }, { status: 500 });
  }
}
