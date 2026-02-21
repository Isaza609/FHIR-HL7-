#!/usr/bin/env python3
"""
Simula consulta de disponibilidad (RF-06): Slot con status=free.
Uso: python scripts/consulta_slots_libres.py [base_url] [--schedule id]
"""
import sys
import urllib.parse

try:
    import requests
except ImportError:
    print("Instala dependencias: pip install -r requirements.txt")
    sys.exit(1)

def main():
    base_url = "http://hapi.fhir.org/baseR4"
    schedule_id = None
    args = sys.argv[1:]
    if args and not args[0].startswith("--"):
        base_url = args.pop(0).rstrip("/")
    if "--schedule" in args:
        i = args.index("--schedule")
        schedule_id = args[i + 1] if i + 1 < len(args) else None

    params = {"status": "free"}
    if schedule_id:
        params["schedule"] = f"Schedule/{schedule_id}"
    url = f"{base_url}/Slot?" + urllib.parse.urlencode(params)
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
