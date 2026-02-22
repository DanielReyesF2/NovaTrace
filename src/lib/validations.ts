import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createBatchSchema = z.object({
  processType: z.enum(["PYROLYSIS", "DISTILLATION"]).optional(),
  parentBatchIds: z.array(z.string()).optional(),
  feedstockType: z.string().min(1),
  feedstockOrigin: z.string().min(1),
  feedstockWeight: z.number().positive(),
  feedstockCondition: z.string().optional(),
  contaminationPct: z.number().min(0).max(100).optional(),
  operators: z.array(z.string()).min(1),
  notes: z.string().optional(),
});

export const updateBatchSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "INCOMPLETE", "TEST"]).optional(),
  oilOutput: z.number().min(0).optional(),
  oilWeightKg: z.number().min(0).optional(),
  residueWeightKg: z.number().min(0).optional(),
  yieldPercent: z.number().min(0).max(100).optional(),
  maxReactorTemp: z.number().optional(),
  dieselConsumedL: z.number().min(0).optional(),
  durationMinutes: z.number().min(0).optional(),
  stopReason: z.string().optional(),
  notes: z.string().optional(),
});

export const createReadingSchema = z.object({
  timestamp: z.string().datetime().optional(),
  reactorTemp: z.number().optional(),
  controlTemp: z.number().optional(),
  steelTemp: z.number().optional(),
  chainTemp: z.number().optional(),
  compressorPsi: z.number().optional(),
  regulatorPsi: z.number().optional(),
  damperPosition: z.number().optional(),
  equipmentId: z.string().optional(),
  notes: z.string().optional(),
});

export const createEventSchema = z.object({
  timestamp: z.string().datetime().optional(),
  type: z.enum([
    "VALVE_CHANGE",
    "EQUIPMENT_TOGGLE",
    "FUEL_ADD",
    "INCIDENT",
    "OBSERVATION",
    "PHASE_CHANGE",
  ]),
  detail: z.string().min(1),
  notes: z.string().optional(),
});

export const createPhotoSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["FEEDSTOCK", "PROCESS", "PRODUCT", "LABEL", "PLANT", "OTHER"]),
  caption: z.string().optional(),
  takenAt: z.string().datetime().optional(),
});

export const createLabResultSchema = z.object({
  labName: z.string().min(1),
  labCertification: z.string().optional(),
  sampleNumber: z.string().min(1),
  lotNumber: z.string().optional(),
  reportDate: z.string().datetime(),
  crepitation: z.string().optional(),
  appearance: z.string().optional(),
  viscosity40C: z.number().optional(),
  color: z.string().optional(),
  waterContent: z.number().optional(),
  sulfurPercent: z.number().optional(),
  additionalTests: z.record(z.string()).optional(),
  verdict: z.string().optional(),
  analystName: z.string().optional(),
});

// ── Equipment ──

export const createEquipmentSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "REACTOR", "DISTILLER", "CONDENSER", "BUFFER_CHAMBER",
    "BURNER", "BLOWER", "PUMP", "COMPRESSOR", "TANK",
    "VALVE", "DAMPER", "COOLING_TOWER", "GAS_SYSTEM", "PIPING",
    "THERMOCOUPLE", "SCALE", "FLOW_METER", "PRESSURE_GAUGE",
    "HYGROMETER", "TIMER", "CONTROL_PANEL", "CONVEYOR", "OTHER",
  ]),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  subsystem: z.string().optional(),
  specs: z.record(z.unknown()).optional(),
  tag: z.string().optional(),
  parentEquipmentId: z.string().optional(),
  calibrationDate: z.string().datetime().optional(),
  calibrationExpiry: z.string().datetime().optional(),
  calibrationProvider: z.string().optional(),
  calibrationCertUrl: z.string().url().optional(),
  accuracySpec: z.string().optional(),
  calibrationStatus: z.enum(["VALID", "EXPIRING", "EXPIRED", "RETIRED"]).optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

// ── Product Fractions ──

export const createFractionSchema = z.object({
  type: z.enum([
    "HEAVY_CRUDE",
    "MEDIUM_OIL",
    "LIGHT_NAPHTHA",
    "GAS_CONDENSABLE",
    "GAS_NONCONDENSABLE",
    "REFINED_DIESEL",
    "CRUDE_MIX",
    "OTHER",
  ]),
  outputPoint: z.string().optional(),
  name: z.string().optional(),
  quantityL: z.number().min(0).optional(),
  quantityKg: z.number().min(0).optional(),
  densityKgL: z.number().min(0).optional(),
  temperatureRangeC: z.string().optional(),
  destination: z.string().optional(),
  equipmentId: z.string().optional(),
  labResultId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateFractionSchema = createFractionSchema.partial();

// ── Audit Log Query ──

export const auditQuerySchema = z.object({
  entity: z.string().optional(),
  entityId: z.string().optional(),
  batchId: z.string().optional(),
  userId: z.string().optional(),
  action: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});
