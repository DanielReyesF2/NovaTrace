-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('PYROLYSIS', 'DISTILLATION');

-- CreateEnum
CREATE TYPE "FractionType" AS ENUM ('HEAVY_CRUDE', 'MEDIUM_OIL', 'LIGHT_NAPHTHA', 'GAS_CONDENSABLE', 'GAS_NONCONDENSABLE', 'REFINED_DIESEL', 'CRUDE_MIX', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('THERMOCOUPLE', 'SCALE', 'FLOW_METER', 'PRESSURE_GAUGE', 'HYGROMETER', 'CONDENSER', 'BUFFER_CHAMBER', 'REACTOR', 'DISTILLER', 'TIMER', 'OTHER');

-- CreateEnum
CREATE TYPE "CalibrationStatus" AS ENUM ('VALID', 'EXPIRING', 'EXPIRED', 'RETIRED');

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "parentBatchIds" TEXT[],
ADD COLUMN     "processType" "ProcessType" NOT NULL DEFAULT 'PYROLYSIS';

-- AlterTable
ALTER TABLE "LabResult" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "ProcessEvent" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Reading" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "equipmentId" TEXT;

-- CreateTable
CREATE TABLE "ProductFraction" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "type" "FractionType" NOT NULL,
    "outputPoint" TEXT,
    "name" TEXT,
    "quantityL" DOUBLE PRECISION,
    "quantityKg" DOUBLE PRECISION,
    "densityKgL" DOUBLE PRECISION,
    "temperatureRangeC" TEXT,
    "destination" TEXT,
    "equipmentId" TEXT,
    "labResultId" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "serialNumber" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "location" TEXT,
    "calibrationDate" TIMESTAMP(3),
    "calibrationExpiry" TIMESTAMP(3),
    "calibrationProvider" TEXT,
    "calibrationCertUrl" TEXT,
    "accuracySpec" TEXT,
    "calibrationStatus" "CalibrationStatus" NOT NULL DEFAULT 'VALID',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "batchId" TEXT,
    "changes" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductFraction_labResultId_key" ON "ProductFraction"("labResultId");

-- CreateIndex
CREATE INDEX "ProductFraction_batchId_idx" ON "ProductFraction"("batchId");

-- CreateIndex
CREATE INDEX "Equipment_type_idx" ON "Equipment"("type");

-- CreateIndex
CREATE INDEX "Equipment_calibrationExpiry_idx" ON "Equipment"("calibrationExpiry");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_batchId_idx" ON "AuditLog"("batchId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessEvent" ADD CONSTRAINT "ProcessEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFraction" ADD CONSTRAINT "ProductFraction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFraction" ADD CONSTRAINT "ProductFraction_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFraction" ADD CONSTRAINT "ProductFraction_labResultId_fkey" FOREIGN KEY ("labResultId") REFERENCES "LabResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFraction" ADD CONSTRAINT "ProductFraction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
