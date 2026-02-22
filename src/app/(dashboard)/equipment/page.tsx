import { prisma } from "@/lib/prisma";
import { EquipmentRegistry } from "@/components/equipment/EquipmentRegistry";

export default async function EquipmentPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { name: "asc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { readings: true, fractions: true } },
    },
  });

  const now = new Date();
  const expiringSoon = equipment.filter(
    (e) =>
      e.calibrationExpiry &&
      e.calibrationExpiry > now &&
      e.calibrationExpiry.getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000
  ).length;
  const expired = equipment.filter(
    (e) => e.calibrationExpiry && e.calibrationExpiry < now
  ).length;

  return (
    <EquipmentRegistry
      equipment={JSON.parse(JSON.stringify(equipment))}
      stats={{
        total: equipment.length,
        active: equipment.filter((e) => e.isActive).length,
        expiringSoon,
        expired,
      }}
    />
  );
}
