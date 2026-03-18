## FHIR Camp 2026 — Plantilla práctica (FastAPI + React)

Esta plantilla implementa el flujo de `Flujo.md` como una app con:
- **Backend**: FastAPI (BFF) que habla con un **HAPI FHIR público**
- **Frontend**: React (Vite) para ejecutar el flujo y ver resultados

### Ejecutar (Windows / PowerShell)

#### 1) Backend

```powershell
cd backend
copy .env.example .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2) Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

### Cómo usar en clase
- Cambia `FHIR_NAMESPACE` en `backend/.env` por grupo (ej. `asmed-g02`) para evitar colisiones en HAPI público.
- Usa los botones en orden: **Seed → Encounter Norte → Encounter Sur → Interop Summary**.

