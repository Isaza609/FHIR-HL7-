from __future__ import annotations

from typing import Any, Dict, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .fhir_client import FhirClient
from .settings import settings
from . import resources as r


app = FastAPI(title="ASMED FHIR Lab API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _client() -> FhirClient:
    return FhirClient(base_url=settings.fhir_base_url)


@app.get("/api/health")
async def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "fhirBaseUrl": settings.fhir_base_url,
        "namespace": settings.fhir_namespace,
    }


@app.get("/api/fhir/metadata")
async def fhir_metadata() -> Dict[str, Any]:
    # CapabilityStatement (útil para validar que el HAPI responde)
    try:
        return await _client().get("metadata")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


def _validate_resource_type(resource_type: str) -> str:
    rt = resource_type.strip()
    if not rt or not rt.replace("-", "").isalnum():
        raise HTTPException(status_code=400, detail="resourceType inválido")
    # FHIR types normalmente empiezan en mayúscula; no forzamos, pero limpiamos
    return rt


def _validate_id(resource_id: str) -> str:
    rid = resource_id.strip()
    if not rid or any(c.isspace() for c in rid):
        raise HTTPException(status_code=400, detail="id inválido")
    return rid


class FhirUpsertResponse(BaseModel):
    resourceType: str
    id: str
    fullUrl: Optional[str] = None
    resource: Dict[str, Any]


@app.get("/api/fhir/{resource_type}/{resource_id}")
async def fhir_read(resource_type: str, resource_id: str) -> Dict[str, Any]:
    rt = _validate_resource_type(resource_type)
    rid = _validate_id(resource_id)
    try:
        return await _client().get(f"{rt}/{rid}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.get("/api/fhir/{resource_type}")
async def fhir_search(resource_type: str, request: Request) -> Dict[str, Any]:
    """
    Búsqueda manual: pasa query params tal cual al servidor FHIR.
    Ej: /api/fhir/Encounter?subject=Patient/123&location=Location/abc
    """
    rt = _validate_resource_type(resource_type)
    params = dict(request.query_params)
    try:
        return await _client().get(rt, params=params or None)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e


@app.post("/api/fhir/{resource_type}", response_model=FhirUpsertResponse)
async def fhir_create(resource_type: str, body: Dict[str, Any]) -> FhirUpsertResponse:
    """
    Creación manual: POST ResourceType.
    El body debe contener "resourceType" coherente.
    """
    rt = _validate_resource_type(resource_type)
    if body.get("resourceType") not in (None, rt):
        raise HTTPException(status_code=400, detail="El body.resourceType no coincide con la ruta")
    body["resourceType"] = rt
    try:
        created = await _client().post(rt, json=body)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    rid = str(created.get("id") or "")
    return FhirUpsertResponse(resourceType=rt, id=rid, fullUrl=f"{settings.fhir_base_url}/{rt}/{rid}" if rid else None, resource=created)


@app.put("/api/fhir/{resource_type}/{resource_id}", response_model=FhirUpsertResponse)
async def fhir_update(resource_type: str, resource_id: str, body: Dict[str, Any]) -> FhirUpsertResponse:
    """
    Actualización manual: PUT ResourceType/{id}.
    """
    rt = _validate_resource_type(resource_type)
    rid = _validate_id(resource_id)
    if body.get("resourceType") not in (None, rt):
        raise HTTPException(status_code=400, detail="El body.resourceType no coincide con la ruta")
    if body.get("id") not in (None, rid):
        raise HTTPException(status_code=400, detail="El body.id no coincide con la ruta")
    body["resourceType"] = rt
    body["id"] = rid

    try:
        updated = await _client().put(f"{rt}/{rid}", json=body)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return FhirUpsertResponse(resourceType=rt, id=rid, fullUrl=f"{settings.fhir_base_url}/{rt}/{rid}", resource=updated)


class SeedResponse(BaseModel):
    created: Dict[str, str]


@app.post("/api/seed", response_model=SeedResponse)
async def seed_context() -> SeedResponse:
    """
    Bloque A del Flujo.md:
    - Organization ASMED SALUD
    - Location Hospital Norte/Sur
    - HealthcareService por sede
    - Practitioner (Laura, Carlos)
    - PractitionerRole (Laura->Norte, Carlos->Sur)
    - Patient Maria Gómez
    """
    ns = settings.fhir_namespace
    i = r.ids(ns)

    org = r.organization_asmed(ns)
    loc_n = r.location_hospital(ns, which="norte")
    loc_s = r.location_hospital(ns, which="sur")
    svc_n = r.healthcare_service_mg(ns, which="norte")
    svc_s = r.healthcare_service_mg(ns, which="sur")
    prac_l = r.practitioner(ns, which="laura")
    prac_c = r.practitioner(ns, which="carlos")
    role_ln = r.practitioner_role(ns, which="laura-norte")
    role_cs = r.practitioner_role(ns, which="carlos-sur")
    pat = r.patient_maria(ns)

    bundle = r.bundle_transaction(
        [
            r.tx_put(org),
            r.tx_put(loc_n),
            r.tx_put(loc_s),
            r.tx_put(svc_n),
            r.tx_put(svc_s),
            r.tx_put(prac_l),
            r.tx_put(prac_c),
            r.tx_put(role_ln),
            r.tx_put(role_cs),
            r.tx_put(pat),
        ]
    )

    try:
        await _client().post("", json=bundle)  # POST {base}/ con Bundle transaction
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"No se pudo sembrar datos: {e}") from e

    return SeedResponse(
        created={
            "Organization": f"Organization/{i['org']}",
            "LocationNorte": f"Location/{i['loc_norte']}",
            "LocationSur": f"Location/{i['loc_sur']}",
            "PractitionerLaura": f"Practitioner/{i['prac_laura']}",
            "PractitionerCarlos": f"Practitioner/{i['prac_carlos']}",
            "PractitionerRoleLauraNorte": f"PractitionerRole/{i['role_laura_norte']}",
            "PractitionerRoleCarlosSur": f"PractitionerRole/{i['role_carlos_sur']}",
            "PatientMaria": f"Patient/{i['patient_maria']}",
        }
    )


class EncounterCreateResponse(BaseModel):
    encounter: str
    condition: str
    observations: Dict[str, str]


@app.post("/api/encounters/first", response_model=EncounterCreateResponse)
async def create_first_encounter() -> EncounterCreateResponse:
    """
    Bloque B (primer acto asistencial): Hospital Norte con Dra. Laura.
    Crea Encounter + Condition + Observations (signos vitales) en una transacción.
    """
    ns = settings.fhir_namespace
    i = r.ids(ns)

    enc = r.encounter_1_norte(ns)
    cond = r.condition(ns, which="cefalea")
    obs_bp = r.observation_vitals(ns, encounter="1", which="bp")
    obs_hr = r.observation_vitals(ns, encounter="1", which="hr")
    obs_temp = r.observation_vitals(ns, encounter="1", which="temp")

    bundle = r.bundle_transaction([r.tx_put(enc), r.tx_put(cond), r.tx_put(obs_bp), r.tx_put(obs_hr), r.tx_put(obs_temp)])

    try:
        await _client().post("", json=bundle)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"No se pudo crear el primer encuentro: {e}") from e

    return EncounterCreateResponse(
        encounter=f"Encounter/{i['enc_1']}",
        condition=f"Condition/{i['cond_1']}",
        observations={"bp": f"Observation/{i['obs_1_bp']}", "hr": f"Observation/{i['obs_1_hr']}", "temp": f"Observation/{i['obs_1_temp']}"},
    )


@app.post("/api/encounters/second", response_model=EncounterCreateResponse)
async def create_second_encounter() -> EncounterCreateResponse:
    """
    Bloque C (continuidad asistencial): Hospital Sur con Dr. Carlos.
    Crea segundo Encounter + Condition + Observations.
    """
    ns = settings.fhir_namespace
    i = r.ids(ns)

    enc = r.encounter_2_sur(ns)
    cond = r.condition(ns, which="control")
    obs_bp = r.observation_vitals(ns, encounter="2", which="bp")
    obs_hr = r.observation_vitals(ns, encounter="2", which="hr")

    bundle = r.bundle_transaction([r.tx_put(enc), r.tx_put(cond), r.tx_put(obs_bp), r.tx_put(obs_hr)])

    try:
        await _client().post("", json=bundle)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"No se pudo crear el segundo encuentro: {e}") from e

    return EncounterCreateResponse(
        encounter=f"Encounter/{i['enc_2']}",
        condition=f"Condition/{i['cond_2']}",
        observations={"bp": f"Observation/{i['obs_2_bp']}", "hr": f"Observation/{i['obs_2_hr']}"},
    )


class InteropSummary(BaseModel):
    patient: str
    encounters: Dict[str, Any]
    observations: Dict[str, Any]
    conditions: Dict[str, Any]
    encounters_by_location_norte: Dict[str, Any]
    encounters_by_location_sur: Dict[str, Any]
    encounters_by_practitioner_laura: Dict[str, Any]
    encounters_by_practitioner_carlos: Dict[str, Any]


@app.get("/api/interop/summary", response_model=InteropSummary)
async def interop_summary() -> InteropSummary:
    """
    Consultas clave del Flujo.md para evidenciar interoperabilidad:
    - recursos del paciente (Encounter/Observation/Condition)
    - recursos por sede (Encounter?location=)
    - atenciones por profesional (Encounter?participant=)
    """
    ns = settings.fhir_namespace
    i = r.ids(ns)
    c = _client()

    patient_ref = f"Patient/{i['patient_maria']}"

    try:
        encs = await c.get("Encounter", params={"subject": patient_ref})
        obs = await c.get("Observation", params={"subject": patient_ref})
        conds = await c.get("Condition", params={"subject": patient_ref})

        encs_n = await c.get("Encounter", params={"location": f"Location/{i['loc_norte']}"})
        encs_s = await c.get("Encounter", params={"location": f"Location/{i['loc_sur']}"})

        encs_laura = await c.get("Encounter", params={"participant": f"Practitioner/{i['prac_laura']}"})
        encs_carlos = await c.get("Encounter", params={"participant": f"Practitioner/{i['prac_carlos']}"})
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Error consultando interoperabilidad: {e}") from e

    return InteropSummary(
        patient=patient_ref,
        encounters=encs,
        observations=obs,
        conditions=conds,
        encounters_by_location_norte=encs_n,
        encounters_by_location_sur=encs_s,
        encounters_by_practitioner_laura=encs_laura,
        encounters_by_practitioner_carlos=encs_carlos,
    )

