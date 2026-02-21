#!/usr/bin/env python3
"""
Carga todos los recursos FHIR del proyecto en el servidor central.
Orden: Organization → Location → HealthcareService → Practitioner → PractitionerRole
       → Patient → Coverage → Schedule → Slot (Appointment y AppointmentResponse se crean en flujo de agendamiento).
Uso: python scripts/cargar_recursos.py [base_url]
Default base_url: http://hapi.fhir.org/baseR4
"""
import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Instala dependencias: pip install -r requirements.txt")
    sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent.parent
FHIR_DIR = BASE_DIR / "fhir_resources"
ORDEN_TIPOS = [
    "Organization",
    "Location",
    "HealthcareService",
    "Practitioner",
    "PractitionerRole",
    "Patient",
    "Coverage",
    "Schedule",
    "Slot",
]


def cargar_recurso(base_url: str, resource_type: str, resource_id: str, data: dict) -> bool:
    url = f"{base_url}/{resource_type}/{resource_id}"
    r = requests.put(url, json=data, headers={"Content-Type": "application/fhir+json"})
    if r.status_code in (200, 201):
        print(f"  OK {resource_type}/{resource_id}")
        return True
    print(f"  ERROR {resource_type}/{resource_id}: {r.status_code} - {r.text[:200]}")
    return False


def main():
    base_url = (sys.argv[1] if len(sys.argv) > 1 else "http://hapi.fhir.org/baseR4").rstrip("/")
    print(f"Servidor FHIR: {base_url}")
    if not FHIR_DIR.is_dir():
        print(f"No se encuentra {FHIR_DIR}")
        sys.exit(1)

    total_ok = 0
    total_err = 0
    for resource_type in ORDEN_TIPOS:
        type_dir = FHIR_DIR / resource_type
        if not type_dir.is_dir():
            continue
        print(f"\n--- {resource_type} ---")
        for f in sorted(type_dir.glob("*.json")):
            with open(f, "r", encoding="utf-8") as fp:
                data = json.load(fp)
            rid = data.get("id") or f.stem
            if cargar_recurso(base_url, resource_type, rid, data):
                total_ok += 1
            else:
                total_err += 1

    print(f"\nResumen: {total_ok} OK, {total_err} errores")
    sys.exit(1 if total_err else 0)


if __name__ == "__main__":
    main()
