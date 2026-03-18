from __future__ import annotations

from pydantic import BaseModel
from dotenv import load_dotenv
import os


load_dotenv()


class Settings(BaseModel):
    fhir_base_url: str = os.getenv("FHIR_BASE_URL", "https://hapi.fhir.org/baseR4").rstrip("/")
    fhir_namespace: str = os.getenv("FHIR_NAMESPACE", "asmed-grupo-01")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


settings = Settings()

