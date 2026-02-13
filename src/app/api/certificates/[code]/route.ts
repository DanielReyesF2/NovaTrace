import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const certificate = await prisma.certificate.findUnique({
      where: { code },
      include: {
        batch: {
          include: {
            labResults: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    // Record verification timestamp
    if (!certificate.verifiedAt) {
      await prisma.certificate.update({
        where: { id: certificate.id },
        data: { verifiedAt: new Date() },
      });
    }

    // Return public-safe data only
    const { batch } = certificate;
    return NextResponse.json({
      certificate: {
        code: certificate.code,
        hash: certificate.hash,
        generatedAt: certificate.generatedAt,
        verifiedAt: certificate.verifiedAt,
      },
      batch: {
        code: batch.code,
        date: batch.date,
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
        impact: {
          co2Baseline: batch.co2Baseline,
          co2Project: batch.co2Project,
          co2Avoided: batch.co2Avoided,
        },
        lab: batch.labResults.map((l) => ({
          labName: l.labName,
          certification: l.labCertification,
          sulfurPercent: l.sulfurPercent,
          waterContent: l.waterContent,
          verdict: l.verdict,
        })),
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json({ error: "Error de verificación" }, { status: 500 });
  }
}
