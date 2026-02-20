import { prisma } from "@/lib/prisma";
import { LabDashboard } from "@/components/lab/LabDashboard";

export default async function LabPage() {
  const labResults = await prisma.labResult.findMany({
    orderBy: { reportDate: "desc" },
    include: {
      batch: {
        select: {
          id: true,
          code: true,
          date: true,
          status: true,
          feedstockType: true,
          oilOutput: true,
        },
      },
    },
  });

  // Stats
  const totalLabs = labResults.length;
  const uniqueLabs = new Set(labResults.map((l) => l.labName)).size;
  const batchesWithLab = new Set(labResults.map((l) => l.batchId)).size;

  return (
    <LabDashboard
      labResults={JSON.parse(JSON.stringify(labResults))}
      stats={{ totalLabs, uniqueLabs, batchesWithLab }}
    />
  );
}
