import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLabAnalysis } from "@/lib/nova-ai";

export async function GET() {
  try {
    await requireAuth();

    // Fetch all lab results with batch info
    const labResults = await prisma.labResult.findMany({
      orderBy: { reportDate: "desc" },
      include: {
        batch: {
          select: { id: true, code: true },
        },
      },
    });

    if (labResults.length === 0) {
      return NextResponse.json(
        { error: "No hay resultados de laboratorio para analizar." },
        { status: 404 }
      );
    }

    // Get the batch code for context
    const batchCode = labResults[0].batch.code;

    // Serialize for the analysis engine
    const serialized = JSON.parse(JSON.stringify(labResults));

    const analysis = await generateLabAnalysis(serialized, batchCode);

    if (!analysis) {
      return NextResponse.json(
        { error: "Nova AI no pudo generar el análisis de laboratorio." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      analysis,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Lab Insights API]", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Error interno al generar análisis de laboratorio" },
      { status: 500 }
    );
  }
}
