# Mockups ACME Salud

Interfaz de ejemplo (HTML + Tailwind) para los canales de agendamiento de ACME Salud.

## Cómo correr los mockups

### Opción 1 – Abrir directamente en el navegador

Abre cualquiera de los archivos HTML con doble clic o arrastrando al navegador:

- **login.html** — Punto de entrada (login)
- **home.html** — Inicio (sedes, servicios)
- **search.html** — Solicitar cita / búsqueda
- **calendar.html** — Calendario
- **confirm.html** — Confirmación de cita
- **callcenter.html** — Vista Call Center
- **admin.html** — Admin

Desde **home.html** o **login.html** puedes navegar por el resto usando el menú.

### Opción 2 – Servidor local (recomendado)

Para evitar problemas con rutas o si más adelante se añaden recursos locales, sirve la carpeta con un servidor HTTP.

**Con Python** (desde esta carpeta `acme_mockups`):

```bash
# En la carpeta acme_mockups
cd acme_mockups
python -m http.server 8080
```

Luego abre en el navegador: **http://localhost:8080/login.html** (o **home.html**).

**Con PowerShell** (si tienes Node.js instalado):

```powershell
cd acme_mockups
npx --yes serve -p 8080
```

Abre **http://localhost:8080**.

## Estructura

| Archivo        | Corresponde a (entregable)     |
|----------------|---------------------------------|
| login.html     | Acceso / inicio de sesión      |
| home.html      | Inicio, selección de sede       |
| search.html    | Solicitar cita (servicio, búsqueda) |
| calendar.html  | Disponibilidad / calendario     |
| confirm.html   | Confirmación de cita            |
| callcenter.html| Vista Call Center (operador)    |
| admin.html     | Admin / ventanilla              |
