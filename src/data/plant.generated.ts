/**
 * GENERATED — do not edit by hand.
 * Baked from src/data/gdb_source/*.csv + the real work_zones polygons
 * (temp.gdb, authored in ArcGIS Pro) by scratch/remap_real_zones.py.
 * Zones carry REAL WGS84 ring geometry; people collapsed to 4 groups;
 * all dates shifted to start after 2026-10-20.
 */

import type { Person, Equipment, Zone, Task } from '../store/types';

export const generatedPeople: Person[] = [
  {
    "id": "R-OPS",
    "name": "Operations Group",
    "crew": "Panel/Field Operator",
    "color": "#2b8a9e",
    "primaryTrade": "Panel/Field Operator",
    "homeArea": "Crude Unit",
    "shiftStart": "2026-10-21T06:00:00.000Z",
    "shiftEnd": "2026-10-21T16:00:00.000Z",
    "dailyCapacityHrs": 9.0,
    "availability": "Available"
  },
  {
    "id": "R-INST",
    "name": "I&E & Controls Group",
    "crew": "I&E Technician",
    "color": "#c2691d",
    "primaryTrade": "I&E Technician",
    "homeArea": "Hydrotreating",
    "shiftStart": "2026-10-21T07:00:00.000Z",
    "shiftEnd": "2026-10-21T17:00:00.000Z",
    "dailyCapacityHrs": 9.0,
    "availability": "Available"
  },
  {
    "id": "R-MECH",
    "name": "Mechanical Group",
    "crew": "Mechanical / Fixed Equipment",
    "color": "#8a63d2",
    "primaryTrade": "Mechanical / Fixed Equipment",
    "homeArea": "Crude Unit",
    "shiftStart": "2026-10-21T06:00:00.000Z",
    "shiftEnd": "2026-10-21T16:00:00.000Z",
    "dailyCapacityHrs": 9.0,
    "availability": "Available"
  },
  {
    "id": "R-ROT",
    "name": "Rotating & Environmental Group",
    "crew": "Rotating Equipment / Environmental",
    "color": "#4a9e6b",
    "primaryTrade": "Rotating Equipment / Environmental",
    "homeArea": "FCC Complex",
    "shiftStart": "2026-10-21T06:30:00.000Z",
    "shiftEnd": "2026-10-21T16:30:00.000Z",
    "dailyCapacityHrs": 9.0,
    "availability": "Available"
  }
];

export const generatedEquipment: Equipment[] = [
  {
    "id": "EQ-001",
    "name": "Rough Terrain Crane 90t",
    "type": "Crane",
    "heightM": 12.5,
    "widthM": 3.0,
    "lengthM": 14.2,
    "weightKg": 48000.0,
    "color": "#7d8590"
  },
  {
    "id": "EQ-002",
    "name": "Vacuum Truck",
    "type": "Vac Truck",
    "heightM": 3.6,
    "widthM": 2.5,
    "lengthM": 9.1,
    "weightKg": 15800.0,
    "color": "#7d8590"
  },
  {
    "id": "EQ-003",
    "name": "Hydroblast Unit",
    "type": "Hydroblaster",
    "heightM": 3.9,
    "widthM": 2.6,
    "lengthM": 10.5,
    "weightKg": 20400.0,
    "color": "#7d8590"
  },
  {
    "id": "EQ-004",
    "name": "Mobile Scaffold Rig",
    "type": "Scaffold",
    "heightM": 3.5,
    "widthM": 2.5,
    "lengthM": 9.8,
    "weightKg": 17500.0,
    "color": "#7d8590"
  },
  {
    "id": "EQ-005",
    "name": "Nitrogen Pump Unit",
    "type": "Nitrogen Pump",
    "heightM": 3.2,
    "widthM": 2.4,
    "lengthM": 7.3,
    "weightKg": 12900.0,
    "color": "#7d8590"
  },
  {
    "id": "EQ-006",
    "name": "Boom Lift 60ft",
    "type": "Aerial Lift",
    "heightM": 2.6,
    "widthM": 2.3,
    "lengthM": 8.4,
    "weightKg": 9800.0,
    "color": "#7d8590"
  }
];

export const generatedZones: Zone[] = [
  {
    "id": "CU-T01",
    "name": "CU-T01 · Crude Distillation Tower",
    "weatherExposed": false,
    "area": "Crude Unit",
    "assetClass": "Crude Distillation Tower",
    "position": [
      -118.41061451,
      33.9141851,
      0
    ],
    "rings": [
      [
        [
          -118.41065476,
          33.91414504
        ],
        [
          -118.4106611,
          33.91415264
        ],
        [
          -118.41066603,
          33.91416123
        ],
        [
          -118.41066939,
          33.91417054
        ],
        [
          -118.41067109,
          33.91418029
        ],
        [
          -118.41067106,
          33.91419019
        ],
        [
          -118.41066932,
          33.91419993
        ],
        [
          -118.41066591,
          33.91420922
        ],
        [
          -118.41066094,
          33.91421778
        ],
        [
          -118.41065456,
          33.91422535
        ],
        [
          -118.41064696,
          33.91423169
        ],
        [
          -118.41063838,
          33.91423662
        ],
        [
          -118.41062907,
          33.91423998
        ],
        [
          -118.41061932,
          33.91424168
        ],
        [
          -118.41060942,
          33.91424165
        ],
        [
          -118.41059968,
          33.91423991
        ],
        [
          -118.41059038,
          33.9142365
        ],
        [
          -118.41058182,
          33.91423153
        ],
        [
          -118.41057426,
          33.91422515
        ],
        [
          -118.41056791,
          33.91421756
        ],
        [
          -118.41056299,
          33.91420897
        ],
        [
          -118.41055962,
          33.91419966
        ],
        [
          -118.41055793,
          33.91418991
        ],
        [
          -118.41055795,
          33.91418001
        ],
        [
          -118.41055969,
          33.91417027
        ],
        [
          -118.4105631,
          33.91416098
        ],
        [
          -118.41056807,
          33.91415242
        ],
        [
          -118.41057445,
          33.91414485
        ],
        [
          -118.41058205,
          33.91413851
        ],
        [
          -118.41059063,
          33.91413358
        ],
        [
          -118.41059994,
          33.91413022
        ],
        [
          -118.4106097,
          33.91412852
        ],
        [
          -118.41061959,
          33.91412854
        ],
        [
          -118.41062934,
          33.91413029
        ],
        [
          -118.41063863,
          33.91413369
        ],
        [
          -118.41064719,
          33.91413866
        ],
        [
          -118.41065476,
          33.91414504
        ]
      ]
    ]
  },
  {
    "id": "CU-F01",
    "name": "CU-F01 · Atmospheric Furnace",
    "weatherExposed": true,
    "area": "Crude Unit",
    "assetClass": "Atmospheric Furnace",
    "position": [
      -118.4108444,
      33.91418526,
      0
    ],
    "rings": [
      [
        [
          -118.41086516,
          33.91412307
        ],
        [
          -118.41087564,
          33.91412762
        ],
        [
          -118.41088517,
          33.91413392
        ],
        [
          -118.41089347,
          33.91414178
        ],
        [
          -118.41090027,
          33.91415096
        ],
        [
          -118.41090538,
          33.91416118
        ],
        [
          -118.41090863,
          33.91417214
        ],
        [
          -118.41090993,
          33.91418349
        ],
        [
          -118.41090924,
          33.9141949
        ],
        [
          -118.41090658,
          33.91420601
        ],
        [
          -118.41090204,
          33.9142165
        ],
        [
          -118.41089573,
          33.91422603
        ],
        [
          -118.41088787,
          33.91423433
        ],
        [
          -118.41087869,
          33.91424113
        ],
        [
          -118.41086847,
          33.91424624
        ],
        [
          -118.41085752,
          33.91424949
        ],
        [
          -118.41084616,
          33.91425079
        ],
        [
          -118.41083475,
          33.9142501
        ],
        [
          -118.41082364,
          33.91424744
        ],
        [
          -118.41081316,
          33.91424289
        ],
        [
          -118.41080362,
          33.91423659
        ],
        [
          -118.41079533,
          33.91422873
        ],
        [
          -118.41078853,
          33.91421955
        ],
        [
          -118.41078342,
          33.91420933
        ],
        [
          -118.41078017,
          33.91419837
        ],
        [
          -118.41077886,
          33.91418702
        ],
        [
          -118.41077955,
          33.91417561
        ],
        [
          -118.41078221,
          33.9141645
        ],
        [
          -118.41078676,
          33.91415402
        ],
        [
          -118.41079306,
          33.91414448
        ],
        [
          -118.41080092,
          33.91413619
        ],
        [
          -118.4108101,
          33.91412938
        ],
        [
          -118.41082033,
          33.91412428
        ],
        [
          -118.41083128,
          33.91412102
        ],
        [
          -118.41084263,
          33.91411972
        ],
        [
          -118.41085404,
          33.91412041
        ],
        [
          -118.41086516,
          33.91412307
        ]
      ]
    ]
  },
  {
    "id": "HT-R01",
    "name": "HT-R01 · Hydrotreater Reactor",
    "weatherExposed": true,
    "area": "Hydrotreating",
    "assetClass": "Hydrotreater Reactor",
    "position": [
      -118.41056192,
      33.91416541,
      0
    ],
    "rings": [
      [
        [
          -118.41059709,
          33.91410595
        ],
        [
          -118.41060687,
          33.91411296
        ],
        [
          -118.4106153,
          33.91412157
        ],
        [
          -118.4106221,
          33.9141315
        ],
        [
          -118.41062708,
          33.91414247
        ],
        [
          -118.41063007,
          33.91415413
        ],
        [
          -118.41063099,
          33.91416614
        ],
        [
          -118.41062982,
          33.91417812
        ],
        [
          -118.41062658,
          33.91418972
        ],
        [
          -118.41062138,
          33.91420058
        ],
        [
          -118.41061437,
          33.91421037
        ],
        [
          -118.41060576,
          33.91421879
        ],
        [
          -118.41059583,
          33.91422559
        ],
        [
          -118.41058486,
          33.91423057
        ],
        [
          -118.4105732,
          33.91423356
        ],
        [
          -118.41056119,
          33.91423448
        ],
        [
          -118.41054921,
          33.91423331
        ],
        [
          -118.41053761,
          33.91423007
        ],
        [
          -118.41052675,
          33.91422487
        ],
        [
          -118.41051696,
          33.91421786
        ],
        [
          -118.41050854,
          33.91420925
        ],
        [
          -118.41050173,
          33.91419932
        ],
        [
          -118.41049676,
          33.91418835
        ],
        [
          -118.41049377,
          33.91417669
        ],
        [
          -118.41049284,
          33.91416468
        ],
        [
          -118.41049402,
          33.9141527
        ],
        [
          -118.41049726,
          33.9141411
        ],
        [
          -118.41050246,
          33.91413024
        ],
        [
          -118.41050947,
          33.91412045
        ],
        [
          -118.41051807,
          33.91411203
        ],
        [
          -118.41052801,
          33.91410523
        ],
        [
          -118.41053898,
          33.91410025
        ],
        [
          -118.41055064,
          33.91409726
        ],
        [
          -118.41056264,
          33.91409634
        ],
        [
          -118.41057463,
          33.91409751
        ],
        [
          -118.41058623,
          33.91410075
        ],
        [
          -118.41059709,
          33.91410595
        ]
      ]
    ]
  },
  {
    "id": "TF-V01",
    "name": "TF-V01 · Flare Knockout Drum",
    "weatherExposed": true,
    "area": "Tank Farm & Utilities",
    "assetClass": "Flare Knockout Drum",
    "position": [
      -118.41112382,
      33.91390401,
      0
    ],
    "rings": [
      [
        [
          -118.41116668,
          33.91386469
        ],
        [
          -118.41117286,
          33.91387272
        ],
        [
          -118.41117755,
          33.91388172
        ],
        [
          -118.4111806,
          33.91389138
        ],
        [
          -118.41118193,
          33.91390143
        ],
        [
          -118.41118149,
          33.91391156
        ],
        [
          -118.41117931,
          33.91392147
        ],
        [
          -118.41117543,
          33.91393084
        ],
        [
          -118.41116999,
          33.91393939
        ],
        [
          -118.41116314,
          33.91394687
        ],
        [
          -118.4111551,
          33.91395305
        ],
        [
          -118.41114611,
          33.91395773
        ],
        [
          -118.41113644,
          33.91396079
        ],
        [
          -118.41112639,
          33.91396212
        ],
        [
          -118.41111626,
          33.91396168
        ],
        [
          -118.41110636,
          33.91395949
        ],
        [
          -118.41109699,
          33.91395562
        ],
        [
          -118.41108844,
          33.91395018
        ],
        [
          -118.41108096,
          33.91394333
        ],
        [
          -118.41107478,
          33.91393529
        ],
        [
          -118.41107009,
          33.9139263
        ],
        [
          -118.41106704,
          33.91391663
        ],
        [
          -118.41106571,
          33.91390658
        ],
        [
          -118.41106615,
          33.91389645
        ],
        [
          -118.41106833,
          33.91388655
        ],
        [
          -118.41107221,
          33.91387718
        ],
        [
          -118.41107765,
          33.91386863
        ],
        [
          -118.4110845,
          33.91386115
        ],
        [
          -118.41109254,
          33.91385497
        ],
        [
          -118.41110153,
          33.91385028
        ],
        [
          -118.4111112,
          33.91384723
        ],
        [
          -118.41112125,
          33.9138459
        ],
        [
          -118.41113138,
          33.91384633
        ],
        [
          -118.41114128,
          33.91384852
        ],
        [
          -118.41115065,
          33.9138524
        ],
        [
          -118.4111592,
          33.91385784
        ],
        [
          -118.41116668,
          33.91386469
        ]
      ]
    ]
  },
  {
    "id": "CU-HX01",
    "name": "CU-HX01 · Preheat Exchanger Train",
    "weatherExposed": true,
    "area": "Crude Unit",
    "assetClass": "Preheat Exchanger Train",
    "position": [
      -118.41037994,
      33.91417564,
      0
    ],
    "rings": [
      [
        [
          -118.41053415,
          33.91426981
        ],
        [
          -118.41022971,
          33.91427604
        ],
        [
          -118.41022573,
          33.91408147
        ],
        [
          -118.41053017,
          33.91407524
        ],
        [
          -118.41053415,
          33.91426981
        ]
      ]
    ]
  },
  {
    "id": "FCC-T01",
    "name": "FCC-T01 · Main Fractionator",
    "weatherExposed": true,
    "area": "FCC Complex",
    "assetClass": "Main Fractionator",
    "position": [
      -118.41008165,
      33.91467402,
      0
    ],
    "rings": [
      [
        [
          -118.41028203,
          33.91480378
        ],
        [
          -118.40988554,
          33.91481013
        ],
        [
          -118.40988128,
          33.91454427
        ],
        [
          -118.41027777,
          33.91453792
        ],
        [
          -118.41028203,
          33.91480378
        ]
      ]
    ]
  }
];

export const generatedTasks: Task[] = [
  {
    "id": "WO-26-0001",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "CU-T01",
    "start": "2026-10-21T10:00:00.000Z",
    "end": "2026-10-21T13:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610001",
    "assetId": "CU-T01",
    "assetClass": "Crude Distillation Tower",
    "area": "Crude Unit",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "High",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Completed",
    "estimatedHours": 3.0,
    "actualStart": "2026-10-21T11:30:00.000Z",
    "actualFinish": "2026-10-21T15:06:00.000Z",
    "actualHours": 3.6,
    "scheduleVarianceHrs": 0.6000000000000001,
    "crewTravelMi": 29.7,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Coordinate access with operations.",
    "requiredEquipment": [
      "EQ-002"
    ]
  },
  {
    "id": "WO-26-0002",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-29T12:00:00.000Z",
    "end": "2026-10-29T15:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610002",
    "assetId": "FCC-R01",
    "assetClass": "FCC Reactor",
    "area": "FCC Complex",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "Planned",
    "estimatedHours": 3.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 11.9,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0
  },
  {
    "id": "WO-26-0003",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "HT-R01",
    "start": "2026-10-22T07:00:00.000Z",
    "end": "2026-10-22T13:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610003",
    "assetId": "HT-R01",
    "assetClass": "Hydrotreater Reactor",
    "area": "Hydrotreating",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "High",
    "requiredTrade": "I&E Technician",
    "status": "Completed",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-22T08:00:00.000Z",
    "actualFinish": "2026-10-22T13:30:00.000Z",
    "actualHours": 5.5,
    "scheduleVarianceHrs": -0.5,
    "crewTravelMi": 27.4,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Coordinate access with operations.",
    "requiredEquipment": [
      "EQ-006"
    ]
  },
  {
    "id": "WO-26-0004",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "TF-V01",
    "start": "2026-10-30T09:00:00.000Z",
    "end": "2026-10-30T11:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610004",
    "assetId": "TF-TK01",
    "assetClass": "Crude Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "High",
    "requiredTrade": "Panel/Field Operator",
    "status": "Planned",
    "estimatedHours": 2.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 22.9,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0005",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "CU-HX01",
    "start": "2026-10-23T11:00:00.000Z",
    "end": "2026-10-23T16:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610005",
    "assetId": "CU-HX01",
    "assetClass": "Preheat Exchanger Train",
    "area": "Crude Unit",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "High",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Planned",
    "estimatedHours": 5.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 9.5,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "requiredEquipment": [
      "EQ-001"
    ]
  },
  {
    "id": "WO-26-0006",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-25T09:00:00.000Z",
    "end": "2026-10-25T14:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610006",
    "assetId": "FCC-RG01",
    "assetClass": "FCC Regenerator",
    "area": "FCC Complex",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Low",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Completed",
    "estimatedHours": 5.0,
    "actualStart": "2026-10-25T09:00:00.000Z",
    "actualFinish": "2026-10-25T15:12:00.000Z",
    "actualHours": 6.2,
    "scheduleVarianceHrs": 1.2000000000000002,
    "crewTravelMi": 35.0,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0007",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-28T12:00:00.000Z",
    "end": "2026-10-28T20:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610007",
    "assetId": "HT-C01",
    "assetClass": "Recycle Gas Compressor",
    "area": "Hydrotreating",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "High",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Planned",
    "estimatedHours": 8.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 18.7,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Confirm isolation before work.",
    "requiredEquipment": [
      "EQ-003"
    ]
  },
  {
    "id": "WO-26-0008",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-29T13:00:00.000Z",
    "end": "2026-10-29T15:00:00.000Z",
    "weatherSensitive": false,
    "parentWoId": "WO-26-0007",
    "sapNotification": "10202610008",
    "assetId": "TF-TK02",
    "assetClass": "Product Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Low",
    "requiredTrade": "Environmental Specialist",
    "status": "Completed",
    "estimatedHours": 2.0,
    "actualStart": "2026-10-29T13:00:00.000Z",
    "actualFinish": "2026-10-29T15:18:00.000Z",
    "actualHours": 2.3,
    "scheduleVarianceHrs": 0.2999999999999998,
    "crewTravelMi": 13.6,
    "safetyPermit": false,
    "followUpRequired": true,
    "percentComplete": 100.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0009",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "CU-T01",
    "start": "2026-10-22T10:00:00.000Z",
    "end": "2026-10-22T15:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610009",
    "assetId": "CU-P01",
    "assetClass": "Crude Charge Pump",
    "area": "Crude Unit",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "High",
    "requiredTrade": "I&E Technician",
    "status": "Dispatched",
    "estimatedHours": 5.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 25.0,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0
  },
  {
    "id": "WO-26-0010",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "FCC-T01",
    "start": "2026-10-29T07:00:00.000Z",
    "end": "2026-10-29T11:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610010",
    "assetId": "FCC-T01",
    "assetClass": "Main Fractionator",
    "area": "FCC Complex",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "Low",
    "requiredTrade": "Panel/Field Operator",
    "status": "In Progress",
    "estimatedHours": 4.0,
    "actualStart": "2026-10-29T07:00:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 26.4,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 40.0,
    "plannerNotes": "Verify parts availability before dispatch.",
    "requiredEquipment": [
      "EQ-004"
    ]
  },
  {
    "id": "WO-26-0011",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-30T11:00:00.000Z",
    "end": "2026-10-30T19:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610011",
    "assetId": "HT-HX01",
    "assetClass": "Feed/Effluent Exchanger",
    "area": "Hydrotreating",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Emergency",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Completed",
    "estimatedHours": 8.0,
    "actualStart": "2026-10-30T11:15:00.000Z",
    "actualFinish": "2026-10-30T18:21:00.000Z",
    "actualHours": 7.1,
    "scheduleVarianceHrs": -0.9000000000000004,
    "crewTravelMi": 47.0,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0012",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-23T13:00:00.000Z",
    "end": "2026-10-23T15:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610012",
    "assetId": "TF-P01",
    "assetClass": "Transfer Pump",
    "area": "Tank Farm & Utilities",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Medium",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Completed",
    "estimatedHours": 2.5,
    "actualStart": "2026-10-23T13:30:00.000Z",
    "actualFinish": "2026-10-23T16:48:00.000Z",
    "actualHours": 3.3,
    "scheduleVarianceHrs": 0.7999999999999998,
    "crewTravelMi": 25.8,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "requiredEquipment": [
      "EQ-002"
    ]
  },
  {
    "id": "WO-26-0013",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "CU-F01",
    "start": "2026-10-24T09:00:00.000Z",
    "end": "2026-10-24T11:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610013",
    "assetId": "CU-F01",
    "assetClass": "Atmospheric Furnace",
    "area": "Crude Unit",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "Medium",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "In Progress",
    "estimatedHours": 2.0,
    "actualStart": "2026-10-24T09:00:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 5.1,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 40.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0014",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-26T07:00:00.000Z",
    "end": "2026-10-26T10:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610014",
    "assetId": "FCC-C01",
    "assetClass": "Wet Gas Compressor",
    "area": "FCC Complex",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "In Progress",
    "estimatedHours": 3.0,
    "actualStart": "2026-10-26T08:00:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 23.8,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 40.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0015",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "HT-R01",
    "start": "2026-10-24T07:00:00.000Z",
    "end": "2026-10-24T09:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610015",
    "assetId": "HT-T01",
    "assetClass": "Stripper Column",
    "area": "Hydrotreating",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "Dispatched",
    "estimatedHours": 2.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 31.7,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0
  },
  {
    "id": "WO-26-0016",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "TF-V01",
    "start": "2026-10-27T11:00:00.000Z",
    "end": "2026-10-27T13:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610016",
    "assetId": "TF-V01",
    "assetClass": "Flare Knockout Drum",
    "area": "Tank Farm & Utilities",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "Medium",
    "requiredTrade": "Panel/Field Operator",
    "status": "Planned",
    "estimatedHours": 2.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 42.2,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0017",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "CU-F01",
    "start": "2026-10-28T07:00:00.000Z",
    "end": "2026-10-28T08:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610017",
    "assetId": "CU-V01",
    "assetClass": "Overhead Accumulator Drum",
    "area": "Crude Unit",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Medium",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "In Progress",
    "estimatedHours": 1.5,
    "actualStart": "2026-10-28T06:30:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 41.8,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 25.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0018",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-23T12:00:00.000Z",
    "end": "2026-10-23T13:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610018",
    "assetId": "FCC-P01",
    "assetClass": "Slurry Pump",
    "area": "FCC Complex",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Low",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Planned",
    "estimatedHours": 1.5,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 38.0,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0019",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-23T09:00:00.000Z",
    "end": "2026-10-23T13:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610019",
    "assetId": "HT-P01",
    "assetClass": "Charge Pump",
    "area": "Hydrotreating",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "High",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Planned",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 25.1,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0020",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-21T07:00:00.000Z",
    "end": "2026-10-21T09:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610020",
    "assetId": "TF-P02",
    "assetClass": "Cooling Water Pump",
    "area": "Tank Farm & Utilities",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "High",
    "requiredTrade": "Environmental Specialist",
    "status": "Planned",
    "estimatedHours": 2.5,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 28.6,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0021",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "CU-HX01",
    "start": "2026-10-30T07:00:00.000Z",
    "end": "2026-10-30T13:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610021",
    "assetId": "CU-T02",
    "assetClass": "Crude Distillation Tower",
    "area": "Crude Unit",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "In Progress",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-30T07:15:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 20.2,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 60.0
  },
  {
    "id": "WO-26-0022",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "FCC-T01",
    "start": "2026-10-28T11:00:00.000Z",
    "end": "2026-10-28T13:00:00.000Z",
    "weatherSensitive": true,
    "parentWoId": "WO-26-0021",
    "sapNotification": "10202610022",
    "assetId": "FCC-R02",
    "assetClass": "FCC Reactor",
    "area": "FCC Complex",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "Emergency",
    "requiredTrade": "Panel/Field Operator",
    "status": "On Hold",
    "estimatedHours": 2.0,
    "actualStart": "2026-10-28T12:00:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 44.9,
    "safetyPermit": false,
    "followUpRequired": true,
    "percentComplete": 20.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0023",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-24T11:00:00.000Z",
    "end": "2026-10-24T15:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610023",
    "assetId": "HT-R02",
    "assetClass": "Hydrotreater Reactor",
    "area": "Hydrotreating",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "High",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Completed",
    "estimatedHours": 4.0,
    "actualStart": "2026-10-24T12:30:00.000Z",
    "actualFinish": "2026-10-24T16:12:00.000Z",
    "actualHours": 3.7,
    "scheduleVarianceHrs": -0.2999999999999998,
    "crewTravelMi": 42.4,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0024",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-22T07:00:00.000Z",
    "end": "2026-10-22T09:30:00.000Z",
    "weatherSensitive": false,
    "parentWoId": "WO-26-0023",
    "sapNotification": "10202610024",
    "assetId": "TF-TK03",
    "assetClass": "Crude Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Medium",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "On Hold",
    "estimatedHours": 2.5,
    "actualStart": "2026-10-22T08:30:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 24.5,
    "safetyPermit": false,
    "followUpRequired": true,
    "percentComplete": 20.0
  },
  {
    "id": "WO-26-0025",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "CU-T01",
    "start": "2026-10-22T12:00:00.000Z",
    "end": "2026-10-22T16:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610025",
    "assetId": "CU-HX02",
    "assetClass": "Preheat Exchanger Train",
    "area": "Crude Unit",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "High",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Dispatched",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 34.5,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0026",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-22T07:00:00.000Z",
    "end": "2026-10-22T09:30:00.000Z",
    "weatherSensitive": false,
    "parentWoId": "WO-26-0025",
    "sapNotification": "10202610026",
    "assetId": "FCC-RG02",
    "assetClass": "FCC Regenerator",
    "area": "FCC Complex",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "Completed",
    "estimatedHours": 2.5,
    "actualStart": "2026-10-22T08:00:00.000Z",
    "actualFinish": "2026-10-22T10:42:00.000Z",
    "actualHours": 2.7,
    "scheduleVarianceHrs": 0.20000000000000018,
    "crewTravelMi": 41.6,
    "safetyPermit": false,
    "followUpRequired": true,
    "percentComplete": 100.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0027",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "HT-R01",
    "start": "2026-10-24T09:00:00.000Z",
    "end": "2026-10-24T11:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610027",
    "assetId": "HT-C02",
    "assetClass": "Recycle Gas Compressor",
    "area": "Hydrotreating",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "In Progress",
    "estimatedHours": 2.0,
    "actualStart": "2026-10-24T09:30:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 42.5,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 40.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0028",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "TF-V01",
    "start": "2026-10-23T11:00:00.000Z",
    "end": "2026-10-23T17:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610028",
    "assetId": "TF-TK04",
    "assetClass": "Product Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "Low",
    "requiredTrade": "Panel/Field Operator",
    "status": "Completed",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-23T11:00:00.000Z",
    "actualFinish": "2026-10-23T16:30:00.000Z",
    "actualHours": 5.5,
    "scheduleVarianceHrs": -0.5,
    "crewTravelMi": 23.2,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0029",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "CU-F01",
    "start": "2026-10-24T09:00:00.000Z",
    "end": "2026-10-24T10:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610029",
    "assetId": "CU-P02",
    "assetClass": "Crude Charge Pump",
    "area": "Crude Unit",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Medium",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Dispatched",
    "estimatedHours": 1.5,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 33.3,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0030",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-21T07:00:00.000Z",
    "end": "2026-10-21T11:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610030",
    "assetId": "FCC-T02",
    "assetClass": "Main Fractionator",
    "area": "FCC Complex",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "High",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Completed",
    "estimatedHours": 4.0,
    "actualStart": "2026-10-21T07:15:00.000Z",
    "actualFinish": "2026-10-21T10:21:00.000Z",
    "actualHours": 3.1,
    "scheduleVarianceHrs": -0.8999999999999999,
    "crewTravelMi": 7.3,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0031",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-25T06:00:00.000Z",
    "end": "2026-10-25T12:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610031",
    "assetId": "HT-HX02",
    "assetClass": "Feed/Effluent Exchanger",
    "area": "Hydrotreating",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "Emergency",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Completed",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-25T07:00:00.000Z",
    "actualFinish": "2026-10-25T14:00:00.000Z",
    "actualHours": 7.0,
    "scheduleVarianceHrs": 1.0,
    "crewTravelMi": 32.5,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "requiredEquipment": [
      "EQ-003"
    ]
  },
  {
    "id": "WO-26-0032",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-25T10:00:00.000Z",
    "end": "2026-10-25T16:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610032",
    "assetId": "TF-P03",
    "assetClass": "Transfer Pump",
    "area": "Tank Farm & Utilities",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "Completed",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-25T11:00:00.000Z",
    "actualFinish": "2026-10-25T16:00:00.000Z",
    "actualHours": 5.0,
    "scheduleVarianceHrs": -1.0,
    "crewTravelMi": 28.2,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0
  },
  {
    "id": "WO-26-0033",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "CU-HX01",
    "start": "2026-10-29T06:00:00.000Z",
    "end": "2026-10-29T10:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610033",
    "assetId": "CU-F02",
    "assetClass": "Atmospheric Furnace",
    "area": "Crude Unit",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "Dispatched",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 23.8,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0034",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "FCC-T01",
    "start": "2026-10-22T10:00:00.000Z",
    "end": "2026-10-22T15:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610034",
    "assetId": "FCC-C02",
    "assetClass": "Wet Gas Compressor",
    "area": "FCC Complex",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "High",
    "requiredTrade": "Panel/Field Operator",
    "status": "Completed",
    "estimatedHours": 5.0,
    "actualStart": "2026-10-22T10:00:00.000Z",
    "actualFinish": "2026-10-22T15:48:00.000Z",
    "actualHours": 5.8,
    "scheduleVarianceHrs": 0.7999999999999998,
    "crewTravelMi": 41.1,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0035",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-28T12:00:00.000Z",
    "end": "2026-10-28T15:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610035",
    "assetId": "HT-T02",
    "assetClass": "Stripper Column",
    "area": "Hydrotreating",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Medium",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Dispatched",
    "estimatedHours": 3.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 36.5,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0036",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-27T09:00:00.000Z",
    "end": "2026-10-27T11:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610036",
    "assetId": "TF-V02",
    "assetClass": "Flare Knockout Drum",
    "area": "Tank Farm & Utilities",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Low",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Completed",
    "estimatedHours": 2.5,
    "actualStart": "2026-10-27T09:30:00.000Z",
    "actualFinish": "2026-10-27T11:30:00.000Z",
    "actualHours": 2.0,
    "scheduleVarianceHrs": -0.5,
    "crewTravelMi": 29.4,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0037",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "CU-T01",
    "start": "2026-10-30T12:00:00.000Z",
    "end": "2026-10-30T20:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610037",
    "assetId": "CU-T01",
    "assetClass": "Crude Distillation Tower",
    "area": "Crude Unit",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "Low",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Completed",
    "estimatedHours": 8.0,
    "actualStart": "2026-10-30T12:30:00.000Z",
    "actualFinish": "2026-10-30T20:42:00.000Z",
    "actualHours": 8.2,
    "scheduleVarianceHrs": 0.1999999999999993,
    "crewTravelMi": 22.2,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0038",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-24T10:00:00.000Z",
    "end": "2026-10-24T15:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610038",
    "assetId": "FCC-R01",
    "assetClass": "FCC Reactor",
    "area": "FCC Complex",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "In Progress",
    "estimatedHours": 5.0,
    "actualStart": "2026-10-24T10:00:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 5.0,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 40.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0039",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "HT-R01",
    "start": "2026-10-26T13:00:00.000Z",
    "end": "2026-10-26T19:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610039",
    "assetId": "HT-R01",
    "assetClass": "Hydrotreater Reactor",
    "area": "Hydrotreating",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "High",
    "requiredTrade": "I&E Technician",
    "status": "Completed",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-26T13:30:00.000Z",
    "actualFinish": "2026-10-26T21:18:00.000Z",
    "actualHours": 7.8,
    "scheduleVarianceHrs": 1.7999999999999998,
    "crewTravelMi": 19.9,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0040",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "TF-V01",
    "start": "2026-10-29T09:00:00.000Z",
    "end": "2026-10-29T17:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610040",
    "assetId": "TF-TK01",
    "assetClass": "Crude Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "High",
    "requiredTrade": "Panel/Field Operator",
    "status": "Dispatched",
    "estimatedHours": 8.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 35.3,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0041",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "CU-HX01",
    "start": "2026-10-23T06:00:00.000Z",
    "end": "2026-10-23T12:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610041",
    "assetId": "CU-HX01",
    "assetClass": "Preheat Exchanger Train",
    "area": "Crude Unit",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Medium",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Completed",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-23T05:30:00.000Z",
    "actualFinish": "2026-10-23T12:18:00.000Z",
    "actualHours": 6.8,
    "scheduleVarianceHrs": 0.7999999999999998,
    "crewTravelMi": 17.0,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Bundle with nearby work where practical.",
    "requiredEquipment": [
      "EQ-001"
    ]
  },
  {
    "id": "WO-26-0042",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-25T12:00:00.000Z",
    "end": "2026-10-25T16:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610042",
    "assetId": "FCC-RG01",
    "assetClass": "FCC Regenerator",
    "area": "FCC Complex",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Low",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Dispatched",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 32.0,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0043",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-24T09:00:00.000Z",
    "end": "2026-10-24T10:30:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610043",
    "assetId": "HT-C01",
    "assetClass": "Recycle Gas Compressor",
    "area": "Hydrotreating",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "Medium",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Planned",
    "estimatedHours": 1.5,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 34.2,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0044",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-23T07:00:00.000Z",
    "end": "2026-10-23T09:30:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610044",
    "assetId": "TF-TK02",
    "assetClass": "Product Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Low",
    "requiredTrade": "Environmental Specialist",
    "status": "Planned",
    "estimatedHours": 2.5,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 20.2,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0045",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "CU-T01",
    "start": "2026-10-22T09:00:00.000Z",
    "end": "2026-10-22T11:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610045",
    "assetId": "CU-P01",
    "assetClass": "Crude Charge Pump",
    "area": "Crude Unit",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "Dispatched",
    "estimatedHours": 2.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 19.0,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0046",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "FCC-T01",
    "start": "2026-10-21T12:00:00.000Z",
    "end": "2026-10-21T20:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610046",
    "assetId": "FCC-T01",
    "assetClass": "Main Fractionator",
    "area": "FCC Complex",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "High",
    "requiredTrade": "Panel/Field Operator",
    "status": "Completed",
    "estimatedHours": 8.0,
    "actualStart": "2026-10-21T13:30:00.000Z",
    "actualFinish": "2026-10-21T23:48:00.000Z",
    "actualHours": 10.3,
    "scheduleVarianceHrs": 2.3000000000000007,
    "crewTravelMi": 14.4,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0047",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-28T12:00:00.000Z",
    "end": "2026-10-28T16:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610047",
    "assetId": "HT-HX01",
    "assetClass": "Feed/Effluent Exchanger",
    "area": "Hydrotreating",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Medium",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "Planned",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 30.1,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Photo documentation required."
  },
  {
    "id": "WO-26-0048",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-26T06:00:00.000Z",
    "end": "2026-10-26T14:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610048",
    "assetId": "TF-P01",
    "assetClass": "Transfer Pump",
    "area": "Tank Farm & Utilities",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Low",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "Planned",
    "estimatedHours": 8.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 34.3,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0049",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "CU-F01",
    "start": "2026-10-29T06:00:00.000Z",
    "end": "2026-10-29T09:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610049",
    "assetId": "CU-F01",
    "assetClass": "Atmospheric Furnace",
    "area": "Crude Unit",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "High",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Completed",
    "estimatedHours": 3.0,
    "actualStart": "2026-10-29T06:30:00.000Z",
    "actualFinish": "2026-10-29T09:42:00.000Z",
    "actualHours": 3.2,
    "scheduleVarianceHrs": 0.20000000000000018,
    "crewTravelMi": 6.3,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 100.0
  },
  {
    "id": "WO-26-0050",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-27T09:00:00.000Z",
    "end": "2026-10-27T13:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610050",
    "assetId": "FCC-C01",
    "assetClass": "Wet Gas Compressor",
    "area": "FCC Complex",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "Dispatched",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 22.9,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0
  },
  {
    "id": "WO-26-0051",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "HT-R01",
    "start": "2026-10-25T09:00:00.000Z",
    "end": "2026-10-25T11:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610051",
    "assetId": "HT-T01",
    "assetClass": "Stripper Column",
    "area": "Hydrotreating",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "Dispatched",
    "estimatedHours": 2.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 29.1,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0052",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "TF-V01",
    "start": "2026-10-22T09:00:00.000Z",
    "end": "2026-10-22T13:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610052",
    "assetId": "TF-V01",
    "assetClass": "Flare Knockout Drum",
    "area": "Tank Farm & Utilities",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "High",
    "requiredTrade": "Panel/Field Operator",
    "status": "Planned",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 4.5,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0053",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "CU-F01",
    "start": "2026-10-23T13:00:00.000Z",
    "end": "2026-10-23T15:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610053",
    "assetId": "CU-V01",
    "assetClass": "Overhead Accumulator Drum",
    "area": "Crude Unit",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Low",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "In Progress",
    "estimatedHours": 2.0,
    "actualStart": "2026-10-23T13:30:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 45.3,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 75.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0054",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "FCC-T01",
    "start": "2026-10-22T07:00:00.000Z",
    "end": "2026-10-22T13:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610054",
    "assetId": "FCC-P01",
    "assetClass": "Slurry Pump",
    "area": "FCC Complex",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Medium",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "In Progress",
    "estimatedHours": 6.0,
    "actualStart": "2026-10-22T08:30:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 5.9,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 25.0,
    "plannerNotes": "Verify parts availability before dispatch."
  },
  {
    "id": "WO-26-0055",
    "title": "Mechanical Repair — Repair flange leak / coating anomaly on equipment",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-22T12:00:00.000Z",
    "end": "2026-10-22T15:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610055",
    "assetId": "HT-P01",
    "assetClass": "Charge Pump",
    "area": "Hydrotreating",
    "workType": "Mechanical Repair",
    "description": "Repair flange leak / coating anomaly on equipment",
    "priority": "Low",
    "requiredTrade": "Fixed Equipment Inspector",
    "status": "Dispatched",
    "estimatedHours": 3.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 30.6,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0056",
    "title": "Environmental Compliance — Inspect secondary containment and spill controls",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-24T09:00:00.000Z",
    "end": "2026-10-24T13:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610056",
    "assetId": "TF-P02",
    "assetClass": "Cooling Water Pump",
    "area": "Tank Farm & Utilities",
    "workType": "Environmental Compliance",
    "description": "Inspect secondary containment and spill controls",
    "priority": "Medium",
    "requiredTrade": "Environmental Specialist",
    "status": "Planned",
    "estimatedHours": 4.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 33.7,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0,
    "plannerNotes": "Coordinate access with operations."
  },
  {
    "id": "WO-26-0057",
    "title": "Instrument Calibration — Calibrate pressure/temperature transmitter",
    "personId": "R-INST",
    "zoneId": "CU-HX01",
    "start": "2026-10-25T06:00:00.000Z",
    "end": "2026-10-25T09:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610057",
    "assetId": "CU-T02",
    "assetClass": "Crude Distillation Tower",
    "area": "Crude Unit",
    "workType": "Instrument Calibration",
    "description": "Calibrate pressure/temperature transmitter",
    "priority": "Medium",
    "requiredTrade": "I&E Technician",
    "status": "Planned",
    "estimatedHours": 3.0,
    "actualStart": null,
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 38.4,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 0.0
  },
  {
    "id": "WO-26-0058",
    "title": "Inspection — Routine inspection and operating-condition readings",
    "personId": "R-OPS",
    "zoneId": "FCC-T01",
    "start": "2026-10-27T07:00:00.000Z",
    "end": "2026-10-27T10:00:00.000Z",
    "weatherSensitive": true,
    "sapNotification": "10202610058",
    "assetId": "FCC-R02",
    "assetClass": "FCC Reactor",
    "area": "FCC Complex",
    "workType": "Inspection",
    "description": "Routine inspection and operating-condition readings",
    "priority": "Medium",
    "requiredTrade": "Panel/Field Operator",
    "status": "Completed",
    "estimatedHours": 3.0,
    "actualStart": "2026-10-27T07:00:00.000Z",
    "actualFinish": "2026-10-27T09:24:00.000Z",
    "actualHours": 2.4,
    "scheduleVarianceHrs": -0.6000000000000001,
    "crewTravelMi": 23.6,
    "safetyPermit": false,
    "followUpRequired": false,
    "percentComplete": 100.0,
    "plannerNotes": "Confirm isolation before work."
  },
  {
    "id": "WO-26-0059",
    "title": "Corrective Maintenance — Investigate abnormal vibration / high-temp alarm",
    "personId": "R-MECH",
    "zoneId": "HT-R01",
    "start": "2026-10-27T10:00:00.000Z",
    "end": "2026-10-27T18:00:00.000Z",
    "weatherSensitive": false,
    "sapNotification": "10202610059",
    "assetId": "HT-R02",
    "assetClass": "Hydrotreater Reactor",
    "area": "Hydrotreating",
    "workType": "Corrective Maintenance",
    "description": "Investigate abnormal vibration / high-temp alarm",
    "priority": "Medium",
    "requiredTrade": "Piping/Mechanical Technician",
    "status": "In Progress",
    "estimatedHours": 8.0,
    "actualStart": "2026-10-27T10:30:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 33.0,
    "safetyPermit": true,
    "followUpRequired": false,
    "percentComplete": 60.0,
    "plannerNotes": "Bundle with nearby work where practical."
  },
  {
    "id": "WO-26-0060",
    "title": "Preventive Maintenance — Scheduled lubrication and condition monitoring",
    "personId": "R-ROT",
    "zoneId": "TF-V01",
    "start": "2026-10-25T06:00:00.000Z",
    "end": "2026-10-25T08:30:00.000Z",
    "weatherSensitive": false,
    "parentWoId": "WO-26-0059",
    "sapNotification": "10202610060",
    "assetId": "TF-TK03",
    "assetClass": "Crude Storage Tank",
    "area": "Tank Farm & Utilities",
    "workType": "Preventive Maintenance",
    "description": "Scheduled lubrication and condition monitoring",
    "priority": "Medium",
    "requiredTrade": "Rotating Equipment Technician",
    "status": "On Hold",
    "estimatedHours": 2.5,
    "actualStart": "2026-10-25T06:15:00.000Z",
    "actualFinish": null,
    "actualHours": null,
    "scheduleVarianceHrs": null,
    "crewTravelMi": 6.2,
    "safetyPermit": false,
    "followUpRequired": true,
    "percentComplete": 80.0,
    "plannerNotes": "Photo documentation required."
  }
];

export const GENERATED_ANCHOR_TIME = "2026-10-21T07:00:00.000Z";
