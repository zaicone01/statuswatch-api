# statuswatch-api

GitHub Actions fetches all service statuspages every 5 minutes and writes `public/status.json`.  
GitHub Pages serves that file at `https://zaicone01.github.io/statuswatch-api/status.json`.

## Agregar un servicio

Editá `scripts/fetch.js` y agregá una entrada al array `SERVICES`:

```js
{ id:'mislack', name:'Mi Slack', cat:'Chat', type:'statuspage',
  url:'https://miempresa.statuspage.io/api/v2/summary.json',
  statusPageUrl:'https://miempresa.statuspage.io' },
```

Guardá y commiteá — el próximo run del Action lo incluye automáticamente.  
**No hace falta actualizar la extensión ni pedir re-review a Google.**

## Estructura del JSON

```json
{
  "updatedAt": "2025-06-10T12:00:00.000Z",
  "serviceCount": 53,
  "services": [{ "id": "github", "name": "GitHub", "cat": "Dev", "statusPageUrl": "..." }],
  "statuses": {
    "github": { "id": "github", "status": "ok", "description": "All Systems Operational", ... }
  }
}
```
