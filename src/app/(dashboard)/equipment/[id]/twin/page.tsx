import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EquipmentTwin } from "@/components/equipment/EquipmentTwin";

interface Props {
  params: { id: string };
}

export default async function EquipmentTwinPage({ params }: Props) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: {
      childEquipment: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          tag: true,
          subsystem: true,
          specs: true,
          location: true,
          calibrationStatus: true,
          calibrationExpiry: true,
          isActive: true,
          _count: { select: { readings: true } },
        },
      },
      parentEquipment: {
        select: { id: true, name: true, tag: true },
      },
      readings: {
        orderBy: { timestamp: "desc" },
        take: 20,
        select: {
          id: true,
          timestamp: true,
          reactorTemp: true,
          controlTemp: true,
          steelTemp: true,
          chainTemp: true,
          compressorPsi: true,
          regulatorPsi: true,
          damperPosition: true,
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!equipment) notFound();

  // Serialize for client component
  const data = JSON.parse(JSON.stringify(equipment));

  return <EquipmentTwin equipment={data} />;
}
