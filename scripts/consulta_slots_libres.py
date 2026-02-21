#!/usr/bin/env python3
"""
Simula consulta de disponibilidad (RF-06): Slot con status=free.
En servidor público filtra por nuestros Schedule para no traer datos ajenos.

Uso:
  python scripts/consulta_slots_libres.py [base_url]
  python scripts/consulta_slots_libres.py [base_url] --schedule sched-pr-casas-2025-02
  python scripts/consulta_slots_libres.py [base_url] --all   # sin filtro (evitar en público)
"""
import json
import os
import sys
import urllib.parse

try:
    import requests
except ImportError:
    print("Instala dependencias: pip install -r requirements.txt")
    sys.exit(1)

# Schedules de ACME por defecto (solo nuestros slots en servidor público)
DEFAULT_SCHEDULE_IDS = ["sched-hs-pediatria-2025-02", "sched-pr-casas-2025-02"]


def load_acme_schedule_ids():
    """Carga IDs de Schedule desde config si existe."""
    config_path = os.path.join(
        os.path.dirname(__file__), "..", "config", "filtros-servidor-publico.json"
    )
    if os.path.isfile(config_path):
        try:
            with open(config_path, encoding="utf-8") as f:
                data = json.load(f)
                return data.get("scheduleIds", DEFAULT_SCHEDULE_IDS)
        except (json.JSONDecodeError, OSError):
            pass
    return DEFAULT_SCHEDULE_IDS


def main():
    base_url = "http://hapi.fhir.org/baseR4"
    schedule_id = None
    use_all = False
    args = sys.argv[1:]
    if args and not args[0].startswith("--"):
        base_url = args.pop(0).rstrip("/")
    if "--schedule" in args:
        i = args.index("--schedule")
        schedule_id = args[i + 1] if i + 1 < len(args) else None
    if "--all" in args:
        use_all = True

    schedule_refs = None
    if use_all:
        print("Advertencia: consultando TODOS los slots libres del servidor (pueden ser de otros proyectos).")
    elif schedule_id:
        schedule_refs = [f"Schedule/{schedule_id}"]
    else:
        # Por defecto: solo nuestros Schedule (servidor público)
        schedule_ids = load_acme_schedule_ids()
        schedule_refs = [f"Schedule/{sid}" for sid in schedule_ids]

    # Construir URL: status=free y opcionalmente schedule=... (repetido para OR)
    query = [("status", "free")]
    if schedule_refs:
        for ref in schedule_refs:
            query.append(("schedule", ref))
    url = f"{base_url}/Slot?" + urllib.parse.urlencode(query)

    r = requests.get(url, headers={"Accept": "application/fhir+json"})
    if r.status_code != 200:
        print(f"Error: {r.status_code}\n{r.text[:500]}")
        sys.exit(1)
    data = r.json()
    total = data.get("total", 0)
    entries = data.get("entry", [])
    print(f"Slots libres: {total}")
    for e in entries[:20]:
        res = e.get("resource", {})
        sid = res.get("id", "?")
        start = res.get("start", "?")
        end = res.get("end", "?")
        print(f"  {sid}: {start} -> {end}")
    if total > 20:
        print(f"  ... y {total - 20} más")


if __name__ == "__main__":
    main()
