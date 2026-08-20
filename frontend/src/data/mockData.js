export const MOCK_SYSTEM_STATUS = {
  project: "FieldAI Assistant",
  version: "0.1.0",
  environment: "development",
  components: {
    gemini: {
      name: "Gemini AI Engine",
      status: "ONLINE",
      provider: "Google Gemini",
      model: "gemini-1.5-pro-latest",
      details: "Multimodal Vision, LLM Reasoning, Diagnostic Synthesis"
    },
    nvidia_embeddings: {
      name: "NVIDIA RAG Embeddings",
      status: "ONLINE",
      provider: "NVIDIA API",
      model: "nemotron-3-embed-1b",
      details: "Text Embeddings for Manuals & RAG Only (NVIDIABuild-Autogen-59)"
    },
    knowledge_base: {
      name: "Manuals Vector Index",
      status: "READY",
      provider: "ChromaDB + NVIDIA Embeddings",
      model: "14 documents / 328 chunks",
      details: "RAG vector store indexed"
    },
    database: {
      name: "Telemetry & Maintenance DB",
      status: "CONNECTED",
      provider: "SQLite (Local)",
      model: "field_ai.db",
      details: "Operational with schema version 1.0"
    }
  }
};

export const MOCK_EQUIPMENT_LIST = [
  {
    id: "MOT-4081",
    name: "Main Drive Induction Motor",
    category: "Industrial Motor",
    model: "Simotics 1LE1501-2DB23",
    manufacturer: "Siemens Industrial",
    location: "Line 3 — Extruder Bay",
    installationDate: "2023-04-12",
    status: "MAINTENANCE_REQUIRED",
    healthScore: 74,
    lastServiced: "2026-07-09",
    nextInspection: "2026-08-25",
    openIssuesCount: 1,
    activeErrorCode: "ERR-MOTOR-082",
    telemetry: {
      vibrationRMS: "4.8 mm/s",
      casingTemp: "78.4 °C",
      currentDraw: "114 A",
      voltage: "462 V"
    },
    specifications: {
      "Power Rating": "75 kW (100 HP)",
      "RPM": "1785 RPM",
      "Voltage": "460 V 3-Phase",
      "Full Load Amps": "118 A",
      "Frame Size": "284T"
    }
  },
  {
    id: "PMP-1044",
    name: "High-Pressure Slurry Pump",
    category: "Centrifugal Pump",
    model: "Flowserve Mark 3 ANSI",
    manufacturer: "Flowserve Corp",
    location: "Clarifier Intake Station",
    installationDate: "2022-11-18",
    status: "NOMINAL",
    healthScore: 96,
    lastServiced: "2026-08-01",
    nextInspection: "2026-09-01",
    openIssuesCount: 0,
    activeErrorCode: null,
    telemetry: {
      flowRate: "442 GPM",
      dischargeHead: "178 ft",
      sealPressure: "42 PSI",
      bearingTemp: "54.2 °C"
    },
    specifications: {
      "Flow Rate": "450 GPM",
      "Discharge Head": "180 ft",
      "Impeller Diameter": "10.5 in",
      "Seal Type": "Plan 53A Dual Mechanical"
    }
  },
  {
    id: "CMP-9022",
    name: "Rotary Screw Air Compressor",
    category: "Air Compressor",
    model: "Atlas Copco GA 90 VSD",
    manufacturer: "Atlas Copco",
    location: "Utility Building Compressors Room",
    installationDate: "2021-08-05",
    status: "CRITICAL_ALERT",
    healthScore: 58,
    lastServiced: "2026-06-15",
    nextInspection: "2026-08-22",
    openIssuesCount: 2,
    activeErrorCode: "ERR-CMP-104",
    telemetry: {
      workingPressure: "108 PSI",
      dischargeTemp: "98.5 °C",
      oilDeltaP: "18.2 PSI",
      runningHours: "14,820 hrs"
    },
    specifications: {
      "Capacity": "580 CFM",
      "Working Pressure": "125 PSI",
      "Cooling": "Air Cooled Aftercooler",
      "Oil Type": "Roto-Xtend Duty Fluid"
    }
  },
  {
    id: "CNV-3310",
    name: "Bulk Material Feed Conveyor",
    category: "Conveyor System",
    model: "Flexco HeavyDuty Transporter 48",
    manufacturer: "Flexco Systems",
    location: "Raw Materials Loading Dock",
    installationDate: "2023-01-20",
    status: "NOMINAL",
    healthScore: 91,
    lastServiced: "2026-07-28",
    nextInspection: "2026-08-30",
    openIssuesCount: 0,
    activeErrorCode: null,
    telemetry: {
      beltSpeed: "248 FPM",
      motorAmps: "34 A",
      idlersVibration: "1.2 mm/s",
      tensionerPSI: "65 PSI"
    },
    specifications: {
      "Belt Width": "48 in",
      "Belt Speed": "250 FPM",
      "Drive System": "Shaft-Mounted Gearmotor",
      "Length": "120 ft"
    }
  },
  {
    id: "HVC-6601",
    name: "Cleanroom Packaged HVAC Unit",
    category: "HVAC Unit",
    model: "Trane IntelliPak II 50-Ton",
    manufacturer: "Trane Technologies",
    location: "Cleanroom Rooftop Bay 4",
    installationDate: "2022-03-14",
    status: "NOMINAL",
    healthScore: 88,
    lastServiced: "2026-07-15",
    nextInspection: "2026-09-15",
    openIssuesCount: 0,
    activeErrorCode: null,
    telemetry: {
      supplyTemp: "14.2 °C",
      returnTemp: "21.8 °C",
      filterDeltaP: "0.48 in. w.g.",
      compressorRunHrs: "8,920 hrs"
    },
    specifications: {
      "Tonnage": "50 Tons",
      "Refrigerant": "R-410A",
      "Airflow": "18,000 CFM",
      "Filter Stage": "MERV 14 + HEPA 99.97%"
    }
  }
];

export const MOCK_MANUALS_LIST = [
  {
    id: "MAN-001",
    title: "Simotics 1LE1 AC Induction Motor Service & Maintenance Manual",
    equipmentType: "Industrial Motor",
    manufacturer: "Siemens",
    version: "v3.4 (2024)",
    fileSize: "8.4 MB",
    pages: 148,
    indexedStatus: "INDEXED",
    lastUpdated: "2026-06-10",
    vectorChunksCount: 184
  },
  {
    id: "MAN-002",
    title: "Flowserve Mark 3 ANSI Chemical & Slurry Pump Technical Guide",
    equipmentType: "Centrifugal Pump",
    manufacturer: "Flowserve",
    version: "v2.1 (2023)",
    fileSize: "12.1 MB",
    pages: 210,
    indexedStatus: "INDEXED",
    lastUpdated: "2026-05-18",
    vectorChunksCount: 246
  },
  {
    id: "MAN-003",
    title: "Atlas Copco GA 90 VSD Lubricated Rotary Screw Compressor Manual",
    equipmentType: "Air Compressor",
    manufacturer: "Atlas Copco",
    version: "v4.0 (2024)",
    fileSize: "15.8 MB",
    pages: 280,
    indexedStatus: "INDEXED",
    lastUpdated: "2026-07-02",
    vectorChunksCount: 310
  },
  {
    id: "MAN-004",
    title: "Flexco HeavyDuty Conveyor Belting & Splice Maintenance Handbook",
    equipmentType: "Conveyor System",
    manufacturer: "Flexco",
    version: "v1.8 (2023)",
    fileSize: "5.2 MB",
    pages: 92,
    indexedStatus: "INDEXED",
    lastUpdated: "2026-04-12",
    vectorChunksCount: 108
  },
  {
    id: "MAN-005",
    title: "Trane IntelliPak II Packaged Rooftop Unit Engineering Reference",
    equipmentType: "HVAC Unit",
    manufacturer: "Trane",
    version: "v5.2 (2024)",
    fileSize: "18.9 MB",
    pages: 340,
    indexedStatus: "INDEXED",
    lastUpdated: "2026-06-25",
    vectorChunksCount: 395
  }
];

export const MOCK_MAINTENANCE_HISTORY = [
  {
    id: "MNT-2026-089",
    date: "2026-08-01",
    assetId: "PMP-1044",
    assetName: "High-Pressure Slurry Pump",
    issueType: "Scheduled Preventive Servicing",
    errorCode: null,
    actionTaken: "Flushed mechanical seal barrier fluid, re-greased thrust bearings with Mobilith SHC 100, verified impeller clearance (0.018 in).",
    technician: "Sarah Jenkins (Lead Tech)",
    status: "RESOLVED",
    downtimeHours: 1.5,
    partsReplaced: ["Barrier Fluid Cartridge #BF-10", "Seal O-ring Kit"]
  },
  {
    id: "MNT-2026-077",
    date: "2026-07-28",
    assetId: "CNV-3310",
    assetName: "Bulk Material Feed Conveyor",
    issueType: "Belt Misalignment & Edge Wear",
    errorCode: "WRN-CNV-014",
    actionTaken: "Adjusted take-up screw tensioners, realigned return idlers, installed secondary urethane belt scraper.",
    technician: "Marcus Vance",
    status: "RESOLVED",
    downtimeHours: 2.0,
    partsReplaced: ["Secondary Belt Scraper Blade"]
  },
  {
    id: "MNT-2026-064",
    date: "2026-07-09",
    assetId: "MOT-4081",
    assetName: "Main Drive Induction Motor",
    issueType: "Bearing Lubrication & Thermal Audit",
    errorCode: null,
    actionTaken: "Purged old grease from DE/NDE bearing housings. Injected 45g Klüberplex BEM 41-132. IR thermography showed 62°C nominal operating temp.",
    technician: "Alex Rivera (Vibration Analyst)",
    status: "RESOLVED",
    downtimeHours: 0.75,
    partsReplaced: ["Grease Relief Plugs"]
  },
  {
    id: "MNT-2026-052",
    date: "2026-06-15",
    assetId: "CMP-9022",
    assetName: "Rotary Screw Air Compressor",
    issueType: "Differential Pressure High Warning",
    errorCode: "ERR-CMP-104",
    actionTaken: "Replaced air/oil separator element and pre-filter cartridges. Drained condensate moisture trap.",
    technician: "Sarah Jenkins (Lead Tech)",
    status: "RESOLVED",
    downtimeHours: 3.0,
    partsReplaced: ["Air/Oil Separator Cartridge #OS-88", "Intake Air Filter Element"]
  },
  {
    id: "MNT-2026-041",
    date: "2026-05-20",
    assetId: "HVC-6601",
    assetName: "Cleanroom Packaged HVAC Unit",
    issueType: "Quarterly Filter Bank Replacement",
    errorCode: null,
    actionTaken: "Replaced MERV 14 pre-filters. Verified differential pressure at 0.45 in. w.g. Inspected blower belt tension.",
    technician: "David Kim",
    status: "RESOLVED",
    downtimeHours: 1.0,
    partsReplaced: ["MERV 14 Filter Pack (x8)"]
  }
];

export const MOCK_DIAGNOSTIC_PRESETS = [
  {
    id: "preset-1",
    title: "Induction Motor Flange Misalignment & Harmonic Vibration",
    equipmentId: "MOT-4081",
    errorCode: "ERR-MOTOR-082",
    notes: "High radial vibration on DE bearing during ramp up to 1785 RPM. Subtle oil egress observed near drive coupling flange.",
    imageDescription: "Industrial motor drive coupling with oil discoloration and vibration sensor attached"
  },
  {
    id: "preset-2",
    title: "Air Compressor Differential Pressure Spike",
    equipmentId: "CMP-9022",
    errorCode: "ERR-CMP-104",
    notes: "Discharge temperature elevated at 98°C. Oil delta P gauge is in red hazard zone (>18 PSI).",
    imageDescription: "Compressor separator head with pressure gauge reading in the red zone"
  },
  {
    id: "preset-3",
    title: "Slurry Pump Mechanical Seal Flush Drop",
    equipmentId: "PMP-1044",
    errorCode: "",
    notes: "Plan 53A barrier fluid reservoir level dropped 15% over 4 hours. No active acoustic alarm yet.",
    imageDescription: "Dual mechanical seal piping and barrier fluid pot"
  }
];
