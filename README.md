# Global Conflict Monitor - Frontend

Frontend de l'aplicació **Global Conflict Monitor**, desenvolupat amb **Vue 3**, **Vite**, **Pinia** i desplegat a **Vercel**.

## URL pública

Frontend públic:

https://conflict-monitor-nu.vercel.app

API exposada mitjançant proxy de Vercel:

https://conflict-monitor-nu.vercel.app/api/v1/conflicts

Backend original a Railway:

https://conflicttracker-production-b460.up.railway.app/api/v1/conflicts

## Arquitectura utilitzada

```text
Usuari / Navegador
        |
        v
Frontend Vue 3 + Vite + Pinia
Desplegat a Vercel
https://conflict-monitor-nu.vercel.app
        |
        |  Peticions internes a /api/v1/...
        v
Vercel rewrites / proxy
        |
        v
Backend Spring Boot
Desplegat a Railway
https://conflicttracker-production-b460.up.railway.app
        |
        v
Base de dades PostgreSQL
Supabase
```

El frontend no crida directament Railway des del navegador. Les peticions es fan a `/api/v1/...` dins del domini de Vercel i Vercel les redirigeix al backend de Railway mitjançant `vercel.json`. Això evita problemes de CORS mentre el backend continua estant desplegat a Railway.

## Configuració de variables d'entorn

### Desenvolupament local

Crear un fitxer `.env` a l'arrel del projecte frontend:

```env
VITE_API_URL=http://localhost:8080
```

Si es vol provar localment contra el backend desplegat a Railway:

```env
VITE_API_URL=https://conflicttracker-production-b460.up.railway.app
```

### Producció a Vercel

En aquest desplegament s'ha utilitzat `vercel.json` com a proxy. Per tant, a producció es pot deixar `VITE_API_URL` buit o no definir-lo, perquè el frontend farà peticions relatives a:

```text
/api/v1/conflicts
/api/v1/countries
/api/v1/events
/api/v1/factions
```

Vercel les redirigeix cap al backend amb aquesta configuració:

```json
{
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://conflicttracker-production-b460.up.railway.app/api/v1/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## SPA Routing

S'ha afegit el fitxer `vercel.json` per evitar errors 404 en refrescar rutes internes de Vue Router, com ara:

```text
/conflicts
/countries
/conflicts/1
```

La regla següent envia qualsevol ruta del frontend cap a `index.html`:

```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

## Netedat de dades amb Pinia

Al store `src/stores/conflictStore.js` s'ha modificat la manera de fer peticions a l'API.

Abans, si l'API retornava un objecte d'error de Spring Boot, hi havia risc que aquest objecte acabés dins l'estat de Pinia com si fos una dada vàlida.

Ara es comprova que:

- La resposta HTTP sigui correcta (`response.ok`).
- La resposta tingui `Content-Type: application/json`.
- La resposta no sigui un objecte d'error de Spring Boot amb camps com `timestamp`, `status`, `error` o `path`.
- Les llistes de conflictes siguin realment arrays.
- Els conflictes individuals siguin objectes vàlids.

Exemple de comprovació afegida:

```js
function isSpringErrorPayload(data) {
  return (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    ('timestamp' in data || 'error' in data || 'status' in data || 'path' in data)
  )
}
```

## Modificacions realitzades al frontend

### 1. Ús de variables d'entorn

S'ha afegit suport per `VITE_API_URL`:

```js
const API_URL = import.meta.env.VITE_API_URL || ''

function buildApiUrl(path) {
  return `${API_URL}${path}`
}
```

Això permet usar una URL diferent en local i en producció.

### 2. Correcció de l'error 404 inicial

Error inicial:

```text
Request failed with status 404
```

Causa:

El frontend feia peticions relatives com:

```js
fetch('/api/v1/conflicts')
```

A Vercel això apuntava a:

```text
https://conflict-monitor-nu.vercel.app/api/v1/conflicts
```

però Vercel no tenia cap ruta `/api/v1/conflicts` configurada.

Solució:

Afegir `vercel.json` amb un rewrite que envia `/api/v1/...` cap al backend de Railway.

### 3. Correcció del problema de CORS

Error observat:

```text
Failed to fetch
```

Causa probable:

El navegador bloquejava la petició directa des de Vercel cap a Railway perquè el backend encara no tenia el CORS desplegat en producció.

Solució aplicada:

Utilitzar Vercel com a proxy. El navegador crida el mateix domini de Vercel i Vercel redirigeix la petició al backend.

### 4. Protecció de l'estat de Pinia

S'han afegit validacions perquè dades incorrectes o errors de Spring no contaminin l'estat global de Pinia.

## Com executar en local

Instal·lar dependències:

```sh
npm install
```

Executar en desenvolupament:

```sh
npm run dev
```

Compilar per producció:

```sh
npm run build
```

Previsualitzar build:

```sh
npm run preview
```
