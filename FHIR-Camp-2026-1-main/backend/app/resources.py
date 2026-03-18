from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List


def _now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat()


def ids(ns: str) -> Dict[str, str]:
    """
    IDs deterministas para poder referenciar sin "resolver" IDs del servidor.
    En HAPI público evita colisiones usando un namespace por grupo.
    """
    base = ns.strip().lower().replace(" ", "-")
    return {
        "org": f"{base}-org-asmed",
        "loc_norte": f"{base}-loc-hospital-norte",
        "loc_sur": f"{base}-loc-hospital-sur",
        "svc_mg_norte": f"{base}-svc-medicina-general-norte",
        "svc_mg_sur": f"{base}-svc-medicina-general-sur",
        "prac_laura": f"{base}-prac-laura-martinez",
        "prac_carlos": f"{base}-prac-carlos-perez",
        "role_laura_norte": f"{base}-role-laura-norte",
        "role_carlos_sur": f"{base}-role-carlos-sur",
        "patient_maria": f"{base}-pat-maria-gomez",
        "enc_1": f"{base}-enc-1-norte",
        "enc_2": f"{base}-enc-2-sur",
        "cond_1": f"{base}-cond-1-cefalea",
        "cond_2": f"{base}-cond-2-control",
        "obs_1_bp": f"{base}-obs-1-bp",
        "obs_1_hr": f"{base}-obs-1-hr",
        "obs_1_temp": f"{base}-obs-1-temp",
        "obs_2_bp": f"{base}-obs-2-bp",
        "obs_2_hr": f"{base}-obs-2-hr",
    }


def organization_asmed(ns: str) -> Dict[str, Any]:
    i = ids(ns)
    return {
        "resourceType": "Organization",
        "id": i["org"],
        "active": True,
        "identifier": [
            {
                "use": "official",
                "system": f"http://example.org/nit/{ns}",
                "value": "900999999-1",
            }
        ],
        "type": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                        "code": "prov",
                        "display": "Healthcare Provider",
                    }
                ]
            }
        ],
        "name": "ASMED SALUD",
        "telecom": [{"system": "phone", "value": "+57(601)000-0000", "use": "work"}],
        "address": [
            {
                "use": "work",
                "text": "Bogotá D.C., Colombia",
                "city": "Bogotá D.C.",
                "country": "CO",
            }
        ],
    }


def location_hospital(ns: str, *, which: str) -> Dict[str, Any]:
    i = ids(ns)
    if which not in ("norte", "sur"):
        raise ValueError("which must be 'norte' or 'sur'")
    loc_id = i["loc_norte"] if which == "norte" else i["loc_sur"]
    name = "Hospital Norte" if which == "norte" else "Hospital Sur"
    alias = "ASMED-NORTE" if which == "norte" else "ASMED-SUR"
    return {
        "resourceType": "Location",
        "id": loc_id,
        "status": "active",
        "name": name,
        "alias": [alias],
        "mode": "instance",
        "type": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                        "code": "HOSP",
                        "display": "Hospital",
                    }
                ]
            }
        ],
        "managingOrganization": {"reference": f"Organization/{i['org']}"},
        "address": {
            "use": "work",
            "country": "CO",
            "text": f"{name}, Bogotá D.C.",
            "city": "Bogotá D.C.",
        },
    }


def healthcare_service_mg(ns: str, *, which: str) -> Dict[str, Any]:
    i = ids(ns)
    if which not in ("norte", "sur"):
        raise ValueError("which must be 'norte' or 'sur'")
    svc_id = i["svc_mg_norte"] if which == "norte" else i["svc_mg_sur"]
    loc_id = i["loc_norte"] if which == "norte" else i["loc_sur"]
    return {
        "resourceType": "HealthcareService",
        "id": svc_id,
        "active": True,
        "providedBy": {"reference": f"Organization/{i['org']}"},
        "location": [{"reference": f"Location/{loc_id}"}],
        "name": "Servicio de Medicina General",
        "type": [
            {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "408443003",
                        "display": "General medical service",
                    }
                ]
            }
        ],
    }


def practitioner(ns: str, *, which: str) -> Dict[str, Any]:
    i = ids(ns)
    if which == "laura":
        return {
            "resourceType": "Practitioner",
            "id": i["prac_laura"],
            "active": True,
            "name": [{"use": "official", "family": "Martínez", "given": ["Laura"]}],
            "gender": "female",
            "telecom": [{"system": "email", "value": "laura.martinez@example.com"}],
        }
    if which == "carlos":
        return {
            "resourceType": "Practitioner",
            "id": i["prac_carlos"],
            "active": True,
            "name": [{"use": "official", "family": "Pérez", "given": ["Carlos"]}],
            "gender": "male",
            "telecom": [{"system": "email", "value": "carlos.perez@example.com"}],
        }
    raise ValueError("which must be 'laura' or 'carlos'")


def practitioner_role(ns: str, *, which: str) -> Dict[str, Any]:
    i = ids(ns)
    if which == "laura-norte":
        return {
            "resourceType": "PractitionerRole",
            "id": i["role_laura_norte"],
            "active": True,
            "practitioner": {"reference": f"Practitioner/{i['prac_laura']}"},
            "organization": {"reference": f"Organization/{i['org']}"},
            "location": [{"reference": f"Location/{i['loc_norte']}"}],
            "healthcareService": [{"reference": f"HealthcareService/{i['svc_mg_norte']}"}],
            "code": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/practitioner-role",
                            "code": "doctor",
                            "display": "Doctor",
                        }
                    ]
                }
            ],
            "specialty": [
                {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "408467006",
                            "display": "General practice",
                        }
                    ]
                }
            ],
        }
    if which == "carlos-sur":
        return {
            "resourceType": "PractitionerRole",
            "id": i["role_carlos_sur"],
            "active": True,
            "practitioner": {"reference": f"Practitioner/{i['prac_carlos']}"},
            "organization": {"reference": f"Organization/{i['org']}"},
            "location": [{"reference": f"Location/{i['loc_sur']}"}],
            "healthcareService": [{"reference": f"HealthcareService/{i['svc_mg_sur']}"}],
            "code": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/practitioner-role",
                            "code": "doctor",
                            "display": "Doctor",
                        }
                    ]
                }
            ],
            "specialty": [
                {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "408467006",
                            "display": "General practice",
                        }
                    ]
                }
            ],
        }
    raise ValueError("which must be 'laura-norte' or 'carlos-sur'")


def patient_maria(ns: str) -> Dict[str, Any]:
    i = ids(ns)
    return {
        "resourceType": "Patient",
        "id": i["patient_maria"],
        "active": True,
        "identifier": [
            {
                "use": "official",
                "system": f"http://example.org/cc/{ns}",
                "value": "1020304050",
            },
            {
                "use": "usual",
                "system": f"http://example.org/mrn/{ns}",
                "value": "MRN-0001",
            },
        ],
        "name": [{"use": "official", "family": "Gómez", "given": ["María"]}],
        "gender": "female",
        "birthDate": "1994-06-15",
        "telecom": [{"system": "phone", "value": "+57(300)000-0000", "use": "mobile"}],
        "address": [{"use": "home", "text": "Bogotá D.C., Colombia", "country": "CO"}],
    }


def encounter_1_norte(ns: str) -> Dict[str, Any]:
    i = ids(ns)
    start = _now_iso()
    return {
        "resourceType": "Encounter",
        "id": i["enc_1"],
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory",
        },
        "subject": {"reference": f"Patient/{i['patient_maria']}"},
        "serviceProvider": {"reference": f"Organization/{i['org']}"},
        "period": {"start": start, "end": start},
        "location": [{"location": {"reference": f"Location/{i['loc_norte']}"}}],
        "participant": [
            {
                "individual": {"reference": f"Practitioner/{i['prac_laura']}"},
            }
        ],
        "reasonCode": [
            {
                "text": "Consulta medicina general",
            }
        ],
    }


def encounter_2_sur(ns: str) -> Dict[str, Any]:
    i = ids(ns)
    start = _now_iso()
    return {
        "resourceType": "Encounter",
        "id": i["enc_2"],
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory",
        },
        "subject": {"reference": f"Patient/{i['patient_maria']}"},
        "serviceProvider": {"reference": f"Organization/{i['org']}"},
        "period": {"start": start, "end": start},
        "location": [{"location": {"reference": f"Location/{i['loc_sur']}"}}],
        "participant": [
            {
                "individual": {"reference": f"Practitioner/{i['prac_carlos']}"},
            }
        ],
        "reasonCode": [{"text": "Control / continuidad asistencial"}],
    }


def condition(ns: str, *, which: str) -> Dict[str, Any]:
    i = ids(ns)
    if which == "cefalea":
        return {
            "resourceType": "Condition",
            "id": i["cond_1"],
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active",
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": "confirmed",
                    }
                ]
            },
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                            "code": "encounter-diagnosis",
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": "25064002",
                        "display": "Headache",
                    }
                ],
                "text": "Cefalea",
            },
            "subject": {"reference": f"Patient/{i['patient_maria']}"},
            "encounter": {"reference": f"Encounter/{i['enc_1']}"},
            "recordedDate": _now_iso(),
            "asserter": {"reference": f"Practitioner/{i['prac_laura']}"},
        }
    if which == "control":
        return {
            "resourceType": "Condition",
            "id": i["cond_2"],
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active",
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": "provisional",
                    }
                ]
            },
            "code": {"text": "Seguimiento / continuidad asistencial"},
            "subject": {"reference": f"Patient/{i['patient_maria']}"},
            "encounter": {"reference": f"Encounter/{i['enc_2']}"},
            "recordedDate": _now_iso(),
            "asserter": {"reference": f"Practitioner/{i['prac_carlos']}"},
        }
    raise ValueError("which must be 'cefalea' or 'control'")


def observation_vitals(ns: str, *, encounter: str, which: str) -> Dict[str, Any]:
    i = ids(ns)
    if encounter not in ("1", "2"):
        raise ValueError("encounter must be '1' or '2'")
    enc_ref = f"Encounter/{i['enc_1']}" if encounter == "1" else f"Encounter/{i['enc_2']}"
    subj_ref = f"Patient/{i['patient_maria']}"
    when = _now_iso()

    if which == "bp":
        obs_id = i["obs_1_bp"] if encounter == "1" else i["obs_2_bp"]
        return {
            "resourceType": "Observation",
            "id": obs_id,
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "vital-signs",
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "85354-9",
                        "display": "Blood pressure panel with all children optional",
                    }
                ],
                "text": "Presión arterial",
            },
            "subject": {"reference": subj_ref},
            "encounter": {"reference": enc_ref},
            "effectiveDateTime": when,
            "component": [
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "8480-6",
                                "display": "Systolic blood pressure",
                            }
                        ]
                    },
                    "valueQuantity": {"value": 120 if encounter == "1" else 126, "unit": "mmHg"},
                },
                {
                    "code": {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "8462-4",
                                "display": "Diastolic blood pressure",
                            }
                        ]
                    },
                    "valueQuantity": {"value": 80 if encounter == "1" else 82, "unit": "mmHg"},
                },
            ],
        }

    if which == "hr":
        obs_id = i["obs_1_hr"] if encounter == "1" else i["obs_2_hr"]
        return {
            "resourceType": "Observation",
            "id": obs_id,
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "vital-signs",
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}
                ],
                "text": "Frecuencia cardíaca",
            },
            "subject": {"reference": subj_ref},
            "encounter": {"reference": enc_ref},
            "effectiveDateTime": when,
            "valueQuantity": {"value": 78 if encounter == "1" else 74, "unit": "beats/min"},
        }

    if which == "temp":
        if encounter != "1":
            raise ValueError("temp only included in encounter 1 for this starter")
        return {
            "resourceType": "Observation",
            "id": i["obs_1_temp"],
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "vital-signs",
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {"system": "http://loinc.org", "code": "8310-5", "display": "Body temperature"}
                ],
                "text": "Temperatura",
            },
            "subject": {"reference": subj_ref},
            "encounter": {"reference": enc_ref},
            "effectiveDateTime": when,
            "valueQuantity": {"value": 36.7, "unit": "°C"},
        }

    raise ValueError("which must be 'bp', 'hr' or 'temp'")


def bundle_transaction(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {
        "resourceType": "Bundle",
        "type": "transaction",
        "entry": entries,
    }


def tx_put(resource: Dict[str, Any]) -> Dict[str, Any]:
    rtype = resource["resourceType"]
    rid = resource["id"]
    return {
        "resource": resource,
        "request": {"method": "PUT", "url": f"{rtype}/{rid}"},
    }

