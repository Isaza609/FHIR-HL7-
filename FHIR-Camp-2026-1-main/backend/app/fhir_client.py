from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import httpx


@dataclass(frozen=True)
class FhirClient:
    base_url: str

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/{path.lstrip('/')}"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.request(method, url, params=params, json=json, headers=headers)
        content_type = resp.headers.get("content-type", "")
        if "json" in content_type:
            data = resp.json()
        else:
            data = {"raw": resp.text}

        if resp.is_error:
            # HAPI devuelve OperationOutcome normalmente
            raise httpx.HTTPStatusError(
                message=f"FHIR request failed: {method} {url} ({resp.status_code})",
                request=resp.request,
                response=resp,
            )
        return data

    async def get(self, path: str, *, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await self.request("GET", path, params=params)

    async def post(self, path: str, *, json: Dict[str, Any]) -> Dict[str, Any]:
        return await self.request("POST", path, json=json)

    async def put(self, path: str, *, json: Dict[str, Any]) -> Dict[str, Any]:
        return await self.request("PUT", path, json=json)

