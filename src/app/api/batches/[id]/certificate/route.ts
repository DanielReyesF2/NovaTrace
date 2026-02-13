import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { hashBatchData, generateCertCode } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const certs = await prisma.certificate.findMany({
    where: { batchId: id },
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json(certs);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("ADMIN");

    const { id } = await params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { labResults: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    if (batch.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Solo se pueden certificar lotes completados" },
        { status: 400 }
      );
    }

    // Build data for hash
    const certData = {
      batchCode: batch.code,
      date: batch.date.toISOString(),
      feedstock: {
        type: batch.feedstockType,
        origin: batch.feedstockOrigin,
        weight: batch.feedstockWeight,
        contamination: batch.contaminationPct,
      },
      output: {
        oilLiters: batch.oilOutput,
        yieldPercent: batch.yieldPercent,
      },
      lab: batch.labResults.map((l) => ({
        labName: l.labName,
        sampleNumber: l.sampleNumber,
        sulfur: l.sulfurPercent,
        water: l.waterContent,
        verdict: l.verdict,
      })),
      impact: {
        co2Baseline: batch.co2Baseline,
        co2Project: batch.co2Project,
        co2Avoided: batch.co2Avoided,
      },
    };

    const hash = hashBatchData(certData as Record<string, unknown>);
    const code = generateCertCode();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trace.econova.com.mx";

    const certificate = await prisma.certificate.create({
      data: {
        batchId: id,
        code,
        hash,
        qrData: `${appUrl}/verify/${code}`,
        co2Avoided: batch.co2Avoided,
        plasticDiverted: batch.feedstockWeight,
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Error al generar certificado" },
      { status: 500 }
    );
  }
}
