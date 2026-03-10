import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BatchLiveView } from "@/components/batch/BatchLiveView";

export default async function BatchLivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      status: true,
      feedstockType: true,
      feedstockWeight: true,
      feedstockOrigin: true,
      startTime: true,
      operators: true,
      maxReactorTemp: true,
    },
  });

  if (!batch) notFound();

  return <BatchLiveView batch={JSON.parse(JSON.stringify(batch))} />;
}
