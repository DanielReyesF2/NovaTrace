import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper: upsert by name — updates existing or creates new
async function upsertEquipment(
  data: Record<string, unknown>,
  adminId: string
): Promise<string> {
  const name = data.name as string;
  const existing = await prisma.equipment.findFirst({ where: { name } });
  if (existing) {
    const updated = await prisma.equipment.update({
      where: { id: existing.id },
      data: { ...data, createdById: adminId },
    });
    return updated.id;
  }
  const created = await prisma.equipment.create({
    data: { ...data, createdById: adminId } as any,
  });
  console.log(`  + ${name}`);
  return created.id;
}

async function main() {
  console.log("🏭 Seeding complete plant equipment registry...\n");

  const admin = await prisma.user.findUnique({
    where: { email: "daniel@econova.com.mx" },
  });
  if (!admin) {
    console.error("Admin user not found. Run base seed first.");
    return;
  }

  const ids: Record<string, string> = {};

  // ════════════════════════════════════════════
  // PYROLYSIS — REACTOR SYSTEM
  // ════════════════════════════════════════════
  console.log("── PIROLISIS: Reactor ──");

  ids["reactor"] = await upsertEquipment({
    name: "Reactor pirolisis DY-500",
    type: "REACTOR",
    tag: "R-001",
    manufacturer: "Doing (Shangqiu)",
    model: "DY-500",
    location: "Nave principal — centro",
    subsystem: "PYROLYSIS",
    specs: {
      capacityKg: 500,
      material: "Acero al carbono Q345R con recubrimiento interno refractario",
      operatingTempMin: 300,
      operatingTempMax: 520,
      designPressure: "Atmosferico (sin presion)",
      heatingMethod: "Indirecto — camara de combustion perimetral",
      rotationType: "Rotatorio continuo",
      powerKw: 3.0,
      dimensions: "Diametro 2.2m x Largo 5.5m",
      feedSystem: "Tolva lateral con sello hermetico",
      residueDischarge: "Tornillo sin fin inferior automatico",
      lifetime: "10-15 anos",
      batchDuration: "8-9 horas",
    },
  }, admin.id);

  ids["burner"] = await upsertEquipment({
    name: "Quemador multi-combustible",
    type: "BURNER",
    tag: "B-001",
    location: "Camara de combustion — base reactor",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      fuelTypes: ["Diesel (arranque)", "Gas pirolitico (operacion)"],
      startupFuelL: 5,
      startupDuration: "2-3 horas con diesel",
      autosustentable: "Si, con gas pirolitico despues de 140°C control",
      powerKw: 0,
      ignitionType: "Electronico",
      airSupply: "Forzado via sopladores + papalote",
    },
  }, admin.id);

  ids["damper"] = await upsertEquipment({
    name: "Papalote (damper O2)",
    type: "DAMPER",
    tag: "DMP-001",
    location: "Entrada aire — camara de combustion",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      positionRange: "0-6",
      optimalPosition: 6,
      function: "Regulacion de entrada de oxigeno al quemador",
      controlType: "Manual — posicion fija desde arranque",
    },
  }, admin.id);

  ids["blower1"] = await upsertEquipment({
    name: "Soplador 1",
    type: "BLOWER",
    tag: "BL-001",
    location: "Lateral izquierdo — camara de combustion",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      function: "Circulacion de aire forzado — combustion",
      activationTemp: "Control ~80°C (~50 min)",
      powerKw: 0.75,
      controlType: "ON/OFF manual",
      velocityRange: "Baja / Media / Maxima",
    },
  }, admin.id);

  ids["blower2"] = await upsertEquipment({
    name: "Soplador 2",
    type: "BLOWER",
    tag: "BL-002",
    location: "Lateral derecho — camara de combustion",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      function: "Circulacion secundaria para eficiencia termica",
      activationTemp: "Control ~145°C (~80 min)",
      powerKw: 0.75,
      controlType: "ON/OFF manual",
      velocityRange: "Baja / Media / Maxima",
      coolingPhase: "Velocidad maxima durante enfriamiento",
    },
  }, admin.id);

  ids["chain"] = await upsertEquipment({
    name: "Cadena de transmision reactor",
    type: "CONVEYOR",
    tag: "CH-001",
    location: "Eje de rotacion — reactor",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      function: "Transmision de rotacion al tambor reactor",
      material: "Acero templado",
      monitoringParam: "chainTemp",
      typicalTempRange: "Ambiente a ~160°C",
      derivation: "~0.30x reactor temp",
      maintenanceInterval: "Lubricacion cada 50 horas",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // PYROLYSIS — CONDENSATION SYSTEM
  // ════════════════════════════════════════════
  console.log("── PIROLISIS: Condensacion ──");

  ids["buffer_pyro"] = await upsertEquipment({
    name: "Camara de amortiguamiento (pirolisis)",
    type: "BUFFER_CHAMBER",
    tag: "BC-001",
    location: "Salida reactor — punto 1",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Separacion primaria — fracciones pesadas por gravedad",
      outputFraction: "HEAVY_CRUDE",
      outputDensity: 0.88,
      material: "Acero al carbono",
      connectionUpstream: "Reactor R-001 (salida de gases)",
      connectionDownstream: "Condensador 1 (CD-001)",
      condensationRange: ">200°C",
    },
  }, admin.id);

  ids["condenser1"] = await upsertEquipment({
    name: "Condensador 1 (primer condensador)",
    type: "CONDENSER",
    tag: "CD-001",
    location: "Salida reactor — punto 2",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Condensacion de fracciones medias C10-C20",
      outputFraction: "MEDIUM_OIL",
      outputDensity: 0.84,
      coolingType: "Agua — intercambiador de tubos",
      material: "Acero inoxidable 304",
      connectionUpstream: "Buffer chamber BC-001",
      connectionDownstream: "Condensador 2 (CD-002)",
      condensationRange: "150-200°C",
    },
  }, admin.id);

  ids["condenser2"] = await upsertEquipment({
    name: "Condensador 2 (segundo condensador)",
    type: "CONDENSER",
    tag: "CD-002",
    location: "Salida reactor — punto 3",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Condensacion final — nafta ligera C5-C10",
      outputFraction: "LIGHT_NAPHTHA",
      outputDensity: 0.72,
      coolingType: "Agua — intercambiador de tubos",
      material: "Acero inoxidable 304",
      connectionUpstream: "Condensador 1 (CD-001)",
      connectionDownstream: "Sello hidraulico / Gas recirculacion",
      condensationRange: "80-150°C",
    },
  }, admin.id);

  ids["gas_system"] = await upsertEquipment({
    name: "Sistema de recirculacion de gas pirolitico",
    type: "GAS_SYSTEM",
    tag: "GS-001",
    location: "Salida condensador 2 — retorno quemador",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Captura gas no condensable y retorno al quemador como combustible",
      gasType: "GAS_NONCONDENSABLE",
      typicalYield: "~5% de masa feedstock",
      safetyDevice: "Sello hidraulico anti-retorno",
      calorificValue: "~38 MJ/kg",
      connectionUpstream: "Condensador 2 (CD-002)",
      connectionDownstream: "Quemador (B-001)",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // PYROLYSIS — COOLING SYSTEM
  // ════════════════════════════════════════════
  console.log("── PIROLISIS: Enfriamiento ──");

  ids["water_pump_pyro"] = await upsertEquipment({
    name: "Bomba de agua enfriamiento (pirolisis)",
    type: "PUMP",
    tag: "P-001",
    location: "Sistema de enfriamiento — condensadores",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Circulacion de agua de enfriamiento a condensadores 1 y 2",
      activationTemp: "Control ~80°C",
      flowControl: "Variable — minimo al inicio, maximo en produccion y enfriamiento",
      pumpType: "Centrifuga",
      powerKw: 1.5,
      waterConsumptionPerBatch: "~350 L",
    },
  }, admin.id);

  ids["cooling_tower"] = await upsertEquipment({
    name: "Torre de enfriamiento",
    type: "COOLING_TOWER",
    tag: "CT-001",
    location: "Exterior — junto a condensadores",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Disipacion de calor del agua de enfriamiento",
      type: "Evaporativa abierta",
      waterVolume: "~500 L recirculacion",
      evaporativeLoss: "~50 L por lote",
      wastewaterDisposal: "Recirculacion en torre",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // PYROLYSIS — AIR SYSTEM
  // ════════════════════════════════════════════
  console.log("── PIROLISIS: Aire comprimido ──");

  ids["compressor"] = await upsertEquipment({
    name: "Compresor de aire general",
    type: "COMPRESSOR",
    tag: "CP-001",
    location: "Zona de servicios",
    subsystem: "UTILITIES",
    specs: {
      function: "Suministro de aire comprimido general — control de combustion y actuadores",
      operatingPressure: "50-55 PSI",
      optimalPressure: 55,
      maintenancePressure: 50,
      powerKw: 2.2,
      tankCapacityL: 100,
      type: "Piston",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // PYROLYSIS — PRODUCT COLLECTION
  // ════════════════════════════════════════════
  console.log("── PIROLISIS: Recoleccion ──");

  ids["tank_heavy"] = await upsertEquipment({
    name: "Tanque colector aceite pesado",
    type: "TANK",
    tag: "TK-001",
    location: "Bajo amortiguador BC-001",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["buffer_pyro"],
    specs: {
      function: "Recoleccion de fraccion pesada por gravedad",
      material: "Acero al carbono",
      capacityL: 200,
      productType: "HEAVY_CRUDE",
    },
  }, admin.id);

  ids["tank_medium"] = await upsertEquipment({
    name: "Tanque colector aceite medio",
    type: "TANK",
    tag: "TK-002",
    location: "Bajo condensador 1 CD-001",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["condenser1"],
    specs: {
      function: "Recoleccion de fraccion media C10-C20",
      material: "Acero al carbono",
      capacityL: 500,
      productType: "MEDIUM_OIL",
    },
  }, admin.id);

  ids["tank_light"] = await upsertEquipment({
    name: "Tanque colector nafta ligera",
    type: "TANK",
    tag: "TK-003",
    location: "Bajo condensador 2 CD-002",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["condenser2"],
    specs: {
      function: "Recoleccion de nafta ligera C5-C10",
      material: "Acero al carbono",
      capacityL: 300,
      productType: "LIGHT_NAPHTHA",
      safetyNote: "Producto inflamable — flash point <5°C",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // PYROLYSIS — VALVES
  // ════════════════════════════════════════════
  console.log("── PIROLISIS: Valvulas ──");

  ids["valve_sg1"] = await upsertEquipment({
    name: "Valvula SG-1 (salida gases reactor)",
    type: "VALVE",
    tag: "V-001",
    location: "Salida superior reactor",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      function: "Control de flujo de gases piroliticos hacia sistema de condensacion",
      valveType: "Bola — apertura manual",
      size: "DN50",
      material: "Acero inoxidable",
      operatingTemp: "Hasta 500°C",
    },
  }, admin.id);

  ids["valve_drain"] = await upsertEquipment({
    name: "Valvula de drenaje residuos",
    type: "VALVE",
    tag: "V-002",
    location: "Descarga inferior reactor",
    subsystem: "PYROLYSIS",
    parentEquipmentId: ids["reactor"],
    specs: {
      function: "Descarga de char y residuos solidos post-proceso",
      valveType: "Compuerta",
      size: "DN100",
      operatingFrequency: "Una vez por lote (fase de enfriamiento)",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // DISTILLATION SYSTEM
  // ════════════════════════════════════════════
  console.log("── DESTILACION ──");

  ids["distiller"] = await upsertEquipment({
    name: "Unidad de destilacion",
    type: "DISTILLER",
    tag: "D-001",
    location: "Nave secundaria",
    subsystem: "DISTILLATION",
    specs: {
      function: "Refinacion de fracciones piroliticas combinadas a diesel grado combustible",
      processSteps: [
        "Buffer chamber entrada",
        "Calentamiento y evaporacion",
        "Condensacion horizontal",
        "Almacenamiento intermedio",
        "Tratamiento acido",
        "Tratamiento alcalino",
        "Producto final: diesel refinado",
      ],
      inputProducts: ["HEAVY_CRUDE", "MEDIUM_OIL"],
      outputProduct: "REFINED_DIESEL",
      outputDensity: 0.83,
      capacityL: 1000,
      powerKw: 2.0,
    },
  }, admin.id);

  ids["buffer_dist"] = await upsertEquipment({
    name: "Buffer chamber destilacion",
    type: "BUFFER_CHAMBER",
    tag: "BC-002",
    location: "Entrada unidad destilacion D-001",
    subsystem: "DISTILLATION",
    parentEquipmentId: ids["distiller"],
    specs: {
      function: "Separacion inicial y alimentacion controlada al evaporador",
      material: "Acero al carbono",
    },
  }, admin.id);

  ids["condenser_horiz"] = await upsertEquipment({
    name: "Condensador horizontal (destilacion)",
    type: "CONDENSER",
    tag: "CD-003",
    location: "Unidad destilacion D-001",
    subsystem: "DISTILLATION",
    parentEquipmentId: ids["distiller"],
    specs: {
      function: "Condensacion de vapores de destilacion",
      coolingType: "Agua — intercambiador horizontal",
      material: "Acero inoxidable 304",
      orientation: "Horizontal",
      outputProduct: "Diesel condensado (pre-refinacion)",
    },
  }, admin.id);

  ids["tank_dist_storage"] = await upsertEquipment({
    name: "Tanque almacenamiento destilacion",
    type: "TANK",
    tag: "TK-004",
    location: "Post-condensador — unidad destilacion",
    subsystem: "DISTILLATION",
    parentEquipmentId: ids["distiller"],
    specs: {
      function: "Almacenamiento intermedio antes de tratamiento quimico",
      material: "Acero al carbono con recubrimiento epoxy",
      capacityL: 500,
    },
  }, admin.id);

  ids["pump_acid"] = await upsertEquipment({
    name: "Bomba dosificadora acido",
    type: "PUMP",
    tag: "P-002",
    location: "Estacion de tratamiento quimico — destilacion",
    subsystem: "DISTILLATION",
    parentEquipmentId: ids["distiller"],
    specs: {
      function: "Dosificacion de acido sulfurico para tratamiento de diesel",
      pumpType: "Diafragma dosificadora",
      chemicalAgent: "H2SO4 diluido",
      flowRate: "Dosificacion controlada",
      material: "Polipropileno (resistente a acido)",
      powerKw: 0.25,
    },
  }, admin.id);

  ids["pump_alkaline"] = await upsertEquipment({
    name: "Bomba dosificadora alcalino",
    type: "PUMP",
    tag: "P-003",
    location: "Estacion de tratamiento quimico — destilacion",
    subsystem: "DISTILLATION",
    parentEquipmentId: ids["distiller"],
    specs: {
      function: "Dosificacion de solucion alcalina (NaOH) para neutralizacion",
      pumpType: "Diafragma dosificadora",
      chemicalAgent: "NaOH diluido",
      flowRate: "Dosificacion controlada",
      material: "Polipropileno",
      powerKw: 0.25,
    },
  }, admin.id);

  ids["tank_diesel"] = await upsertEquipment({
    name: "Tanque producto final diesel refinado",
    type: "TANK",
    tag: "TK-005",
    location: "Almacen producto terminado",
    subsystem: "DISTILLATION",
    specs: {
      function: "Almacenamiento de diesel refinado — producto final",
      material: "Acero al carbono con recubrimiento",
      capacityL: 2000,
      productType: "REFINED_DIESEL",
      safetyNote: "Area ventilada, extintor ABC",
    },
  }, admin.id);

  ids["pump_transfer_dist"] = await upsertEquipment({
    name: "Bomba de transferencia destilacion",
    type: "PUMP",
    tag: "P-004",
    location: "Entre tanque almacenamiento y tratamiento quimico",
    subsystem: "DISTILLATION",
    parentEquipmentId: ids["distiller"],
    specs: {
      function: "Transferencia de producto entre etapas de destilacion",
      pumpType: "Centrifuga",
      powerKw: 0.75,
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // INSTRUMENTATION
  // ════════════════════════════════════════════
  console.log("── INSTRUMENTACION ──");

  ids["tc_reactor"] = await upsertEquipment({
    name: "Termopar reactor K-type",
    type: "THERMOCOUPLE",
    tag: "TI-001",
    manufacturer: "Omega Engineering",
    model: "KQXL-18G-12",
    location: "Interior reactor — zona central",
    subsystem: "INSTRUMENTATION",
    parentEquipmentId: ids["reactor"],
    calibrationDate: new Date("2025-11-15"),
    calibrationExpiry: new Date("2026-11-15"),
    calibrationProvider: "Instrumentacion Avanzada S.A.",
    accuracySpec: "±0.5°C",
    calibrationStatus: "VALID",
    specs: {
      sensorType: "K-type (Chromel-Alumel)",
      measurementRange: "0-1200°C",
      operatingRange: "22-520°C (proceso)",
      monitoringParam: "reactorTemp",
      responseTime: "<5 segundos",
      insertionLength: "300mm",
    },
  }, admin.id);

  ids["tc_control"] = await upsertEquipment({
    name: "Termopar amortiguador K-type",
    type: "THERMOCOUPLE",
    tag: "TI-002",
    manufacturer: "Omega Engineering",
    model: "KQXL-18G-12",
    location: "Camara de amortiguamiento BC-001",
    subsystem: "INSTRUMENTATION",
    parentEquipmentId: ids["buffer_pyro"],
    calibrationDate: new Date("2025-11-15"),
    calibrationExpiry: new Date("2026-11-15"),
    calibrationProvider: "Instrumentacion Avanzada S.A.",
    accuracySpec: "±0.5°C",
    calibrationStatus: "VALID",
    specs: {
      sensorType: "K-type (Chromel-Alumel)",
      measurementRange: "0-600°C",
      operatingRange: "22-340°C (proceso)",
      monitoringParam: "controlTemp",
      role: "Parametro primario de control de proceso",
      responseTime: "<5 segundos",
    },
  }, admin.id);

  ids["tc_steel"] = await upsertEquipment({
    name: "Sensor temperatura acero reactor",
    type: "THERMOCOUPLE",
    tag: "TI-003",
    location: "Superficie exterior reactor R-001",
    subsystem: "INSTRUMENTATION",
    parentEquipmentId: ids["reactor"],
    specs: {
      sensorType: "Infrarrojo / contacto superficie",
      operatingRange: "Ambiente a ~170°C",
      monitoringParam: "steelTemp",
      derivation: "~0.42x reactor temp + 12°C",
      purpose: "Monitoreo integridad estructural y perdida termica",
    },
  }, admin.id);

  ids["tc_chain"] = await upsertEquipment({
    name: "Sensor temperatura cadena transmision",
    type: "THERMOCOUPLE",
    tag: "TI-004",
    location: "Cadena de transmision CH-001",
    subsystem: "INSTRUMENTATION",
    parentEquipmentId: ids["chain"],
    specs: {
      sensorType: "Contacto",
      operatingRange: "Ambiente a ~160°C",
      monitoringParam: "chainTemp",
      derivation: "~0.30x reactor temp",
      purpose: "Prevenir sobrecalentamiento de transmision",
    },
  }, admin.id);

  ids["pi_compressor"] = await upsertEquipment({
    name: "Manometro compresor aire",
    type: "PRESSURE_GAUGE",
    tag: "PI-001",
    manufacturer: "Winters",
    model: "PFQ-S",
    location: "Compresor CP-001",
    subsystem: "INSTRUMENTATION",
    parentEquipmentId: ids["compressor"],
    calibrationDate: new Date("2025-06-01"),
    calibrationExpiry: new Date("2026-06-01"),
    calibrationProvider: "Instrumentacion Avanzada S.A.",
    accuracySpec: "±1 PSI",
    calibrationStatus: "VALID",
    specs: {
      range: "0-100 PSI",
      operatingSetpoint: 55,
      monitoringParam: "compressorPsi",
    },
  }, admin.id);

  ids["pi_regulator"] = await upsertEquipment({
    name: "Manometro unidad mantenimiento",
    type: "PRESSURE_GAUGE",
    tag: "PI-002",
    location: "Unidad FRL — regulador de presion",
    subsystem: "INSTRUMENTATION",
    parentEquipmentId: ids["compressor"],
    specs: {
      range: "0-100 PSI",
      operatingSetpoint: 50,
      monitoringParam: "regulatorPsi",
      function: "Presion regulada despues de filtro y lubricador",
    },
  }, admin.id);

  ids["scale"] = await upsertEquipment({
    name: "Bascula digital 1000kg",
    type: "SCALE",
    tag: "WI-001",
    manufacturer: "Torrey",
    model: "EQB-100/200",
    location: "Zona de recepcion — entrada planta",
    subsystem: "INSTRUMENTATION",
    calibrationDate: new Date("2025-09-01"),
    calibrationExpiry: new Date("2026-03-01"),
    calibrationProvider: "Metrologica Industrial",
    accuracySpec: "±0.1 kg",
    calibrationStatus: "EXPIRING",
    specs: {
      capacity: "1000 kg",
      resolution: "0.1 kg",
      platformSize: "1.2m x 1.5m",
      function: "Pesaje de feedstock, producto y residuos",
      certification: "NOM-010-SCFI",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // UTILITIES — PIPING & TRANSFERS
  // ════════════════════════════════════════════
  console.log("── UTILIDADES ──");

  ids["piping_gas"] = await upsertEquipment({
    name: "Tuberia de gases piroliticos",
    type: "PIPING",
    tag: "L-001",
    location: "Reactor → Amortiguador → Condensadores",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Transporte de vapores piroliticos del reactor al sistema de condensacion",
      material: "Acero al carbono Schedule 40",
      diameter: "DN80 (3 pulgadas)",
      insulation: "Lana mineral — secciones calientes",
      length: "~8m total",
      operatingTemp: "Hasta 400°C",
    },
  }, admin.id);

  ids["piping_water"] = await upsertEquipment({
    name: "Circuito agua de enfriamiento",
    type: "PIPING",
    tag: "L-002",
    location: "Torre enfriamiento → Condensadores → Retorno",
    subsystem: "UTILITIES",
    specs: {
      function: "Circuito cerrado de agua de enfriamiento para condensadores",
      material: "PVC Schedule 40",
      diameter: "DN50 (2 pulgadas)",
      length: "~25m total",
      waterVolume: "~350L operacion",
    },
  }, admin.id);

  ids["piping_diesel"] = await upsertEquipment({
    name: "Linea de suministro diesel",
    type: "PIPING",
    tag: "L-003",
    location: "Tanque diesel → Quemador",
    subsystem: "PYROLYSIS",
    specs: {
      function: "Alimentacion de diesel al quemador para arranque",
      material: "Acero galvanizado",
      diameter: "DN15 (1/2 pulgada)",
      length: "~5m",
    },
  }, admin.id);

  ids["tank_diesel_fuel"] = await upsertEquipment({
    name: "Tanque diesel combustible (arranque)",
    type: "TANK",
    tag: "TK-006",
    location: "Zona de servicios — junto a compresor",
    subsystem: "UTILITIES",
    specs: {
      function: "Almacenamiento de diesel para arranque del quemador",
      material: "Acero al carbono",
      capacityL: 200,
      fuelType: "Diesel",
      consumptionPerBatch: "2-5 L",
    },
  }, admin.id);

  // ════════════════════════════════════════════
  // ELECTRICAL / CONTROL
  // ════════════════════════════════════════════
  console.log("── CONTROL ELECTRICO ──");

  ids["control_panel"] = await upsertEquipment({
    name: "Panel de control principal",
    type: "CONTROL_PANEL",
    tag: "CP-MAIN",
    location: "Cabina de operacion",
    subsystem: "UTILITIES",
    specs: {
      function: "Centro de control: arranque/paro motores, lectura de instrumentos",
      totalPowerKw: 10.75,
      voltage: "220V trifasico",
      circuitBreakers: true,
      emergencyStop: true,
      components: [
        "Arrancadores de motores (reactor, sopladores, bombas)",
        "Display de temperaturas",
        "Display de presiones",
        "Boton de paro de emergencia",
        "Indicadores luminosos de estado",
      ],
    },
  }, admin.id);

  const totalCreated = Object.keys(ids).length;
  console.log(`\n✅ ${totalCreated} equipos registrados/actualizados en total`);

  // ════════════════════════════════════════════
  // PRODUCT FRACTIONS for existing batches
  // ════════════════════════════════════════════
  const batch = await prisma.batch.findFirst({
    where: { status: "COMPLETED" },
    orderBy: { date: "asc" },
    include: { labResults: true, productFractions: true },
  });

  if (batch && batch.productFractions.length === 0) {
    console.log(`\n📦 Adding fractions to batch ${batch.code}...`);

    const totalOil = batch.oilOutput ?? 0;
    const heavyL = Math.round(totalOil * 0.15 * 10) / 10;
    const mediumL = Math.round(totalOil * 0.50 * 10) / 10;
    const lightL = Math.round(totalOil * 0.25 * 10) / 10;

    const naphthaLab = batch.labResults.find((l) => l.flashPoint != null && l.flashPoint < 10);
    const oilLab = batch.labResults.find((l) => l.flashPoint != null && l.flashPoint > 30);

    await prisma.productFraction.createMany({
      data: [
        {
          batchId: batch.id, type: "HEAVY_CRUDE", outputPoint: "Amortiguador",
          name: "Aceite crudo pesado", quantityL: heavyL,
          quantityKg: Math.round(heavyL * 0.88 * 10) / 10, densityKgL: 0.88,
          destination: "TO_DISTILLATION", equipmentId: ids["buffer_pyro"], createdById: admin.id,
        },
        {
          batchId: batch.id, type: "MEDIUM_OIL", outputPoint: "Condensador 1",
          name: "Aceite medio C10-C20", quantityL: mediumL,
          quantityKg: Math.round(mediumL * 0.84 * 10) / 10, densityKgL: 0.84,
          destination: "TO_DISTILLATION", equipmentId: ids["condenser1"],
          labResultId: oilLab?.id, createdById: admin.id,
        },
        {
          batchId: batch.id, type: "LIGHT_NAPHTHA", outputPoint: "Condensador 2",
          name: "Nafta ligera C5-C10", quantityL: lightL,
          quantityKg: Math.round(lightL * 0.72 * 10) / 10, densityKgL: 0.72,
          destination: "SOLD", equipmentId: ids["condenser2"],
          labResultId: naphthaLab?.id, createdById: admin.id,
        },
        {
          batchId: batch.id, type: "GAS_NONCONDENSABLE", name: "Gas pirolitico NC",
          quantityKg: Math.round((batch.feedstockWeight ?? 0) * 0.05 * 10) / 10,
          destination: "RECIRCULATED", createdById: admin.id,
        },
      ],
    });
    console.log(`  ✅ 4 fractions created for ${batch.code}`);
  } else if (batch) {
    console.log(`  ⏭ Batch ${batch.code} already has fractions`);
  }

  console.log("\n🎉 Complete plant equipment registry seeded!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
