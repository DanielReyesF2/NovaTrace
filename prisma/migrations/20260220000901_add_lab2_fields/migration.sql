-- AlterTable
ALTER TABLE "LabResult" ADD COLUMN     "calorificCalG" DOUBLE PRECISION,
ADD COLUMN     "density20C" DOUBLE PRECISION,
ADD COLUMN     "flashPointOpen" DOUBLE PRECISION,
ADD COLUMN     "labNotes" TEXT,
ADD COLUMN     "productClassification" TEXT,
ADD COLUMN     "viscDynamic20C" DOUBLE PRECISION,
ADD COLUMN     "waterByKFPct" DOUBLE PRECISION,
ADD COLUMN     "waterSedimentPct" DOUBLE PRECISION;
