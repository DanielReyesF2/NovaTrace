-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EquipmentType" ADD VALUE 'BURNER';
ALTER TYPE "EquipmentType" ADD VALUE 'BLOWER';
ALTER TYPE "EquipmentType" ADD VALUE 'PUMP';
ALTER TYPE "EquipmentType" ADD VALUE 'COMPRESSOR';
ALTER TYPE "EquipmentType" ADD VALUE 'TANK';
ALTER TYPE "EquipmentType" ADD VALUE 'VALVE';
ALTER TYPE "EquipmentType" ADD VALUE 'DAMPER';
ALTER TYPE "EquipmentType" ADD VALUE 'COOLING_TOWER';
ALTER TYPE "EquipmentType" ADD VALUE 'GAS_SYSTEM';
ALTER TYPE "EquipmentType" ADD VALUE 'PIPING';
ALTER TYPE "EquipmentType" ADD VALUE 'CONTROL_PANEL';
ALTER TYPE "EquipmentType" ADD VALUE 'CONVEYOR';

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "parentEquipmentId" TEXT,
ADD COLUMN     "specs" JSONB,
ADD COLUMN     "subsystem" TEXT,
ADD COLUMN     "tag" TEXT;

-- CreateIndex
CREATE INDEX "Equipment_subsystem_idx" ON "Equipment"("subsystem");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_parentEquipmentId_fkey" FOREIGN KEY ("parentEquipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
