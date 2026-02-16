import { prisma } from "@/lib/prisma";
import { MexicoTraceabilityMap } from "@/components/map/MexicoTraceabilityMap";

export default async function MapPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { date: "asc" },
    select: {
      code: true,
      feedstockOrigin: true,
      feedstockWeight: true,
      feedstockType: true,
      status: true,
    },
  });

  return (
    <MexicoTraceabilityMap batches={JSON.parse(JSON.stringify(batches))} />
  );
}
