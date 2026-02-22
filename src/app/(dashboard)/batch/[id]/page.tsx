import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BatchDetail } from "@/components/batch/BatchDetail";

export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      readings: { orderBy: { timestamp: "asc" } },
      events: { orderBy: { timestamp: "asc" } },
      photos: { orderBy: { takenAt: "asc" } },
      labResults: true,
      certificates: true,
      productFractions: {
        orderBy: { createdAt: "asc" },
        include: {
          equipment: { select: { id: true, name: true, type: true } },
          labResult: { select: { id: true, sampleNumber: true, productClassification: true } },
        },
      },
    },
  });

  if (!batch) notFound();

  return <BatchDetail batch={JSON.parse(JSON.stringify(batch))} />;
}
