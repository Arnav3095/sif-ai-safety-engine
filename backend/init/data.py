DEMO_USERS = [
    {
        'user_id': 'EMP-101',
        'full_name': 'Abhishek',
        'email': 'staff@oil.com',
        'password': 'staff123',
        'role': 'staff',
        'site_name': 'Mumbai Offshore Platform',
        'department': 'Field Maintenance'
    },
    {
        'user_id': 'ADM-001',
        'full_name': 'Rajesh Sharma',
        'email': 'admin@oil.com',
        'password': 'admin123',
        'role': 'admin',
        'site_name': 'Corporate HSSE HQ',
        'department': 'HSSE Risk Management'
    }
]

LIFE_SAVING_RULES_DATA = [
    {
        'rule_code': 'ES01',
        'rule_name': 'Energy Isolation (LOTO)',
        'description': 'Verify isolation and zero energy state before starting work. Apply Lockout/Tagout (LOTO) tags to all electrical, pneumatic, and hydraulic systems.',
        'keywords': 'energy,isolation,lockout,tagout,pressure release,electrical,de-energize'
    },
    {
        'rule_code': 'HW01',
        'rule_name': 'Hot Work & Spark Protection',
        'description': 'Obtain authorized hot work permit, verify continuous gas monitoring, clear combustible materials within 15 meters, and assign a dedicated fire watch.',
        'keywords': 'hot work,welding,cutting,torch,permit,fire watch,sparks'
    },
    {
        'rule_code': 'CS01',
        'rule_name': 'Confined Space Entry',
        'description': 'Test atmosphere for toxic gases and oxygen levels before entry, secure entry permit, ensure continuous forced ventilation, and position a trained standby attendant.',
        'keywords': 'confined space,entry,rescue,ventilation,monitoring,safe entry,attendant'
    },
    {
        'rule_code': 'LOF01',
        'rule_name': 'Line of Fire Protection',
        'description': 'Position yourself and team clear of suspended loads, rotating equipment zones, high pressure lines, and heavy machinery maneuvering areas.',
        'keywords': 'line of fire,struck by,moving equipment,crane,lifting,mobile'
    },
    {
        'rule_code': 'WH01',
        'rule_name': 'Working at Heights (>2m)',
        'description': 'Inspect harness, lanyards, and anchor points before ascending. Ensure 100% tie-off when working above 2 meters or on scaffolding.',
        'keywords': 'height,fall,ladder,scaffold,harness,working at height,anchor'
    },
    {
        'rule_code': 'MVS01',
        'rule_name': 'Mobile Equipment & Driving',
        'description': 'Wear seatbelts, adhere to site speed limits, perform pre-trip vehicle inspections, and strictly prohibit mobile phone usage while driving.',
        'keywords': 'moving equipment,vibration,machinery,mobile,driving,seatbelt,speed'
    },
    {
        'rule_code': 'HPE01',
        'rule_name': 'High Pressure System Safety',
        'description': 'Inspect pressure relief valves, depressurize systems before line breaking, and establish clear safety barriers during pressure testing.',
        'keywords': 'high pressure,pressure,relief valve,rupture,leak,depressurize'
    },
    {
        'rule_code': 'CT01',
        'rule_name': 'Critical Lifts & Crane Safety',
        'description': 'Perform lift plan calculations, inspect rigging gear, ensure outriggers are fully deployed on firm ground, and use tag lines for load control.',
        'keywords': 'critical lift,heavy lift,crane,load calculation,rigging,tag line'
    },
    {
        'rule_code': 'BSC01',
        'rule_name': 'Bypassing Safety Controls',
        'description': 'Obtain formal authorization before overriding safety interlocks, disabling gas detectors, or bypassing safety-critical equipment.',
        'keywords': 'bypass,override,interlock,gas detector,disable,safety critical'
    },
    {
        'rule_code': 'PTW01',
        'rule_name': 'Permit to Work (PTW) Compliance',
        'description': 'Work with a valid permit to work, verify all control measures on site before starting, and stop work immediately if conditions change.',
        'keywords': 'permit,ptw,permit to work,controls,authorization,stop work'
    },
    {
        'rule_code': 'FFD01',
        'rule_name': 'Fit for Duty & Fatigue Management',
        'description': 'Report for duty well-rested, unimpaired by fatigue, alcohol or drugs, and immediately notify supervisor of any medical limitations.',
        'keywords': 'fit for duty,fatigue,unimpaired,medical,rest,alert'
    },
    {
        'rule_code': 'H2S01',
        'rule_name': 'Toxic Gas & H2S Protection',
        'description': 'Always carry a calibrated personal H2S monitor in process units, know emergency escape routes upwind, and wear SCBA when required.',
        'keywords': 'h2s,toxic gas,detector,scba,upwind,escape route,gas release'
    }
]

PRECURSOR_PATTERNS_DATA = [
    {
        'pattern_id': 'PRE-001',
        'precursor_type': 'Gas_Release',
        'activity': 'Pressure Testing & Line Break',
        'site_name': 'Mumbai Offshore Platform',
        'frequency': 14,
        'sif_precursor_count': 12,
        'non_sif_count': 2,
        'sif_probability': 0.857,
        'severity_index': 8.9
    },
    {
        'pattern_id': 'PRE-002',
        'precursor_type': 'Equipment_Degradation',
        'activity': 'Hot Work & Welding',
        'site_name': 'Assam Refinery Unit 2',
        'frequency': 19,
        'sif_precursor_count': 14,
        'non_sif_count': 5,
        'sif_probability': 0.736,
        'severity_index': 7.8
    },
    {
        'pattern_id': 'PRE-003',
        'precursor_type': 'Procedural_Violation',
        'activity': 'Energy Isolation (LOTO)',
        'site_name': 'Gujarat Refinery Koyali',
        'frequency': 11,
        'sif_precursor_count': 9,
        'non_sif_count': 2,
        'sif_probability': 0.818,
        'severity_index': 8.4
    },
    {
        'pattern_id': 'PRE-004',
        'precursor_type': 'Lack_Supervision',
        'activity': 'Confined Space Entry',
        'site_name': 'Greater Noida HSE Hub',
        'frequency': 8,
        'sif_precursor_count': 6,
        'non_sif_count': 2,
        'sif_probability': 0.750,
        'severity_index': 7.5
    },
    {
        'pattern_id': 'PRE-005',
        'precursor_type': 'Environmental_Factor',
        'activity': 'Critical Heavy Lift Operations',
        'site_name': 'Mumbai Offshore Platform',
        'frequency': 16,
        'sif_precursor_count': 10,
        'non_sif_count': 6,
        'sif_probability': 0.625,
        'severity_index': 6.9
    },
    {
        'pattern_id': 'PRE-006',
        'precursor_type': 'Equipment_Degradation',
        'activity': 'High Pressure Piping Maintenance',
        'site_name': 'Mathura Refinery Processing Unit',
        'frequency': 22,
        'sif_precursor_count': 15,
        'non_sif_count': 7,
        'sif_probability': 0.681,
        'severity_index': 7.2
    },
    {
        'pattern_id': 'PRE-007',
        'precursor_type': 'Procedural_Violation',
        'activity': 'Working at Heights Scaffolding',
        'site_name': 'Panipat Petrochemical Complex',
        'frequency': 13,
        'sif_precursor_count': 9,
        'non_sif_count': 4,
        'sif_probability': 0.692,
        'severity_index': 7.1
    },
    {
        'pattern_id': 'PRE-008',
        'precursor_type': 'Gas_Release',
        'activity': 'Flare & Vent Line Inspection',
        'site_name': 'Haldia Refinery Terminal',
        'frequency': 9,
        'sif_precursor_count': 7,
        'non_sif_count': 2,
        'sif_probability': 0.777,
        'severity_index': 8.0
    }
]
