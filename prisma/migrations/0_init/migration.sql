-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'INCOMPLETE', 'TEST');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('VALVE_CHANGE', 'EQUIPMENT_TOGGLE', 'FUEL_ADD', 'INCIDENT', 'OBSERVATION', 'PHASE_CHANGE');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('FEEDSTOCK', 'PROCESS', 'PRODUCT', 'LABEL', 'PLANT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "feedstockType" TEXT NOT NULL,
    "feedstockOrigin" TEXT NOT NULL,
    "feedstockWeight" DOUBLE PRECISION NOT NULL,
    "feedstockCondition" TEXT,
    "contaminationPct" DOUBLE PRECISION,
    "oilOutput" DOUBLE PRECISION,
    "oilWeightKg" DOUBLE PRECISION,
    "residueWeightKg" DOUBLE PRECISION,
    "yieldPercent" DOUBLE PRECISION,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "maxReactorTemp" DOUBLE PRECISION,
    "dieselConsumedL" DOUBLE PRECISION,
    "stopReason" TEXT,
    "notes" TEXT,
    "operators" TEXT[],
    "co2Baseline" DOUBLE PRECISION,
    "co2Project" DOUBLE PRECISION,
    "co2Avoided" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "reactorTemp" DOUBLE PRECISION,
    "controlTemp" DOUBLE PRECISION,
    "steelTemp" DOUBLE PRECISION,
    "chainTemp" DOUBLE PRECISION,
    "compressorPsi" DOUBLE PRECISION,
    "regulatorPsi" DOUBLE PRECISION,
    "damperPosition" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessEvent" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL,
    "detail" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ProcessEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "PhotoType" NOT NULL,
    "caption" TEXT,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "labName" TEXT NOT NULL,
    "labCertification" TEXT,
    "sampleNumber" TEXT NOT NULL,
    "lotNumber" TEXT,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "crepitation" TEXT,
    "appearance" TEXT,
    "viscosity40C" DOUBLE PRECISION,
    "color" TEXT,
    "waterContent" DOUBLE PRECISION,
    "sulfurPercent" DOUBLE PRECISION,
    "additionalTests" JSONB,
    "verdict" TEXT,
    "pdfUrl" TEXT,
    "analystName" TEXT,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "qrData" TEXT NOT NULL,
    "co2Avoided" DOUBLE PRECISION,
    "plasticDiverted" DOUBLE PRECISION,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_code_key" ON "Batch"("code");

-- CreateIndex
CREATE INDEX "Reading_batchId_timestamp_idx" ON "Reading"("batchId", "timestamp");

-- CreateIndex
CREATE INDEX "ProcessEvent_batchId_timestamp_idx" ON "ProcessEvent"("batchId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_code_key" ON "Certificate"("code");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessEvent" ADD CONSTRAINT "ProcessEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

