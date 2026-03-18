## Backend (FastAPI) — ASMED FHIR Lab

### Requisitos
- Python 3.10+

### Configuración
1) Copia variables de entorno:

```bash
copy .env.example .env
```

2) Instala dependencias:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Ejecutar

```bash
uvicorn app.main:app --reload --port 8000
```

### Endpoints principales
- `GET /api/health`
- `POST /api/seed`
- `POST /api/encounters/first`
- `POST /api/encounters/second`
- `GET /api/interop/summary`

### Notas para HAPI público
- Usa un `FHIR_NAMESPACE` por grupo para evitar colisiones de IDs.
