# crm-corredores-web

Frontend de InmoCRM — CRM mobile-first para corredores inmobiliarios independientes.

App instalable (PWA), con dashboard mobile-first, tipado end-to-end contra el backend vía tRPC, y notificaciones push reales.

---

## Stack técnico

- **Build tool**: Vite
- **Framework**: React + TypeScript
- **Routing**: React Router (`react-router-dom`)
- **Estado local**: Zustand
- **Estado de servidor / cache**: TanStack Query (vía `createTRPCReact` + `httpLink`, sin batching)
- **Estilos**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **PWA**: `vite-plugin-pwa` (estrategia `injectManifest`, Service Worker propio en `src/sw.ts`)
- **Compresión de imágenes**: `browser-image-compression`
- **Linter**: oxlint
- **Hosting**: Cloudflare Workers (free tier)

---

## Estructura del proyecto

Organizado por feature, no por capa técnica:

```
src/
  features/
    properties/
      Properties.tsx        # lista, filtros, alta/edición
      PropertyDetail.tsx     # página de sólo lectura
    leads/
      Leads.tsx
      LeadDetail.tsx          # con mini formulario de timeline
    matches/
      Matches.tsx              # sólo lectura
    agenda/
      Agenda.tsx
      AgendaEventForm.tsx
      agendaGrouping.ts         # agrupa en Vencidos/Hoy/Mañana/Esta semana/Más adelante
    catalogs/
      Catalogs.tsx
    stats/
      Stats.tsx
    auth/
      Auth.tsx
    push/
      push.ts                  # suscripción del navegador
      PushPrompt.tsx             # cartel de activación
  components/                    # compartido entre features
    Modal.tsx
    Navbar.tsx
    DashboardNav.tsx
    DashboardTopbar.tsx
    FilterChips.tsx
    InstallPrompt.tsx
  lib/                             # compartido entre features
    supabase.ts
    useDebouncedValue.ts
    followUp.ts                     # clasificación de fechas de seguimiento (UTC)
  trpc.ts                            # cliente tRPC + RouterOutputs
  sw.ts                                # Service Worker propio (@ts-nocheck)
  App.tsx                              # rutas
```

---

## Pantallas principales

| Ruta | Descripción |
|---|---|
| `/` | Landing pública |
| `/pricing` (hoy `/precios`, pendiente de rename) | Precios (placeholder) |
| `/login` | Login / registro |
| `/app/properties`, `/app/properties/:id` | Propiedades — lista con búsqueda/filtros y detalle |
| `/app/leads`, `/app/leads/:id` | Leads — lista con seguimientos urgentes y detalle con timeline |
| `/app/matches` | Matches automáticos, con motivos explicados |
| `/app/agenda` | Visitas y tareas, lista cronológica agrupada |
| `/app/catalogs` | Catálogos compartibles |
| `/app/stats` | Estadísticas básicas |

Ficha pública de propiedad: `/p/:id` (servida por el backend, no es una ruta de este SPA). Catálogo público: `/c/:id` (ídem).

---

## Variables de entorno

Crear un `.env` en la raíz con:

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

> Estas variables se graban en el JS en el momento del build — cambiarlas requiere un rebuild, no alcanza con actualizar la variable en el hosting.

---

## Cómo correr en desarrollo

```bash
npm install
npm run dev
```

⚠️ La PWA (Service Worker, manifest, instalabilidad) **no está activa en `npm run dev`**. Para probarla:

```bash
npm run build
npm run preview
```

---

## Build y deploy

- **Build Command** (Cloudflare Workers): `npx vite build` (sin `tsc -b` — el import de tipos cruzado con el backend haría fallar el build si se corriera `tsc` completo contra el código real del otro repo).
- Cada tanto conviene correr `npm run build` completo en local (con `tsc -b`), aunque no haya cambios en este repo — el type-check cruzado contra `crm-corredores-api` puede atrapar errores de tipos del backend que ningún otro proceso detecta.

---

## Notificaciones push

- Requiere claves VAPID configuradas del lado del backend.
- `src/lib/push.ts` pide permiso al navegador y crea la suscripción (`PushManager`) usando la VAPID public key.
- `PushPrompt.tsx` muestra el cartel de activación, **excepto en iOS/iPadOS si el sitio no está instalado a pantalla de inicio** — Safari en iOS sólo entrega push a sitios instalados, nunca a una pestaña normal.
- El Service Worker (`src/sw.ts`) tiene listeners `push` (muestra la notificación) y `notificationclick` (enfoca o abre la ventana correspondiente).

---

## Convenciones

- Los slugs de URL van en inglés (`/pricing`), aunque el contenido de la app esté en español.
- Fechas "sólo fecha" (como `nextFollowUpDate`) se manejan siempre en UTC de punta a punta, para evitar desfasajes de un día por zona horaria. Fechas con hora real (como los eventos de Agenda) se manejan en hora local.
- Colores de estado evitan el semáforo rojo/verde salvo que el dato sea objetivamente positivo/negativo (ej. "vencido" sí es rojo; un cambio de precio no tiene rojo/verde porque depende del contexto).
- Cualquier `.map()` de listas se tipa con `RouterOutputs` (inferido del router del backend), nunca `any`.

---

## Repo hermano

El backend vive en un repositorio aparte: `crm-corredores-api`. No es un monorepo — cada uno tiene su propio `package.json`, `node_modules` y deploy independiente. El tipado end-to-end se logra importando `type { AppRouter }` directamente desde el repo del backend en `trpc.ts`.
