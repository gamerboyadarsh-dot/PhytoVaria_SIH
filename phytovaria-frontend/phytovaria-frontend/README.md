# PhytoVaria Frontend (Member 5)

React + Vite + Tailwind dashboard for the PhytoVaria prototype.
Ships with a self-contained **Demo Mode** so it's fully clickable before
the backend/knowledge base/risk engine/ESP32 are wired up.

## Setup

```bash
cd phytovaria-frontend
npm install
cp .env.example .env
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Sign in with
any non-empty username/password — auth is a stub until Member 2's
`/api/auth/login` exists (see `src/context/AuthContext.jsx`).

## Demo Mode

`VITE_DEMO_MODE=true` (the default) makes every API call in
`src/api/endpoints.js` return fixtures from `src/api/mockData.js` instead
of hitting the backend, and makes Environmental Monitoring show simulated
sensor readings. Toggle it live from the pill button in the top bar.

**For the final demo:** set `VITE_DEMO_MODE=false` once the backend is
reachable, but keep the in-app toggle available as the "Demo Sensor Mode"
fallback the brief requires, in case the ESP32 or backend drops on stage.

## Testing what's built

1. `npm run dev`, sign in.
2. Dashboard → shows registered plants (mock: 3 tomato rows) and a risk
   snapshot for the one with `status: "analyzed"`.
3. Register Plant → submit the form → success screen → "Upload genomic
   data".
4. Genomic Upload → drag/drop or browse for any `.vcf` file (content
   isn't parsed client-side in demo mode, only the extension is
   checked) → see the parsed-variant confirmation.
5. Genomic Analysis → variant track + table for the currently selected
   plant (switch plants from the top-bar dropdown).
6. Disease Risk → per-trait scores, "Re-run analysis" button.
7. Environmental Monitoring → temperature/humidity chart, 12 mock
   readings.
8. Explainability → contributing-factor breakdown.
9. Health Report → printable summary (`window.print()`).

## Integration contract for Member 2 (backend)

`src/api/endpoints.js` is the frontend's expected REST contract — treat it
as a proposal, not a demand; flag anything that needs to change so we
don't diverge mid-development. Expected routes (all under `VITE_API_BASE_URL`,
default `/api`):

| Method | Path | Purpose |
|---|---|---|
| GET | `/plants` | list registered plants |
| GET | `/plants/{id}` | plant detail |
| POST | `/plants` | register a plant |
| POST | `/plants/{id}/vcf` | upload VCF (multipart `file`) |
| GET | `/plants/{id}/variants` | parsed variant calls |
| GET | `/plants/{id}/disease-associations` | variant→trait evidence |
| GET | `/plants/{id}/risk-assessment` | latest risk assessment |
| POST | `/plants/{id}/risk-assessment/run` | trigger a fresh run |
| GET | `/plants/{id}/sensor-readings` | recent env. readings |
| GET | `/plants/{id}/report` | generated report payload |

Response shapes the frontend expects are documented as the mock objects in
`src/api/mockData.js` (e.g. `mockRiskAssessment`, `mockVariants`). If the
real backend's shape differs, the only files that need to change are
`src/api/endpoints.js` (swap the `demoMode` branch's real `client.*` call)
— page components should not need to change.

## Folder structure

```
src/
  api/            fetch client, endpoint functions, mock fixtures, useApi() hook
  context/        DemoModeContext, AuthContext, PlantContext (selected plant)
  components/
    layout/       AppShell, Sidebar, Topbar
    ui/           Button, Card, Badge, RiskBadge, StatCard, DataTable,
                   GenomicTrack (signature variant-track visual), States
  pages/          one file per screen (see App.jsx for routes)
  App.jsx         route table
  main.jsx        entry point, provider tree
  index.css       design tokens (colors, focus states, motion)
tailwind.config.js  maps CSS variable tokens into Tailwind color/font utilities
```

## Design notes

- Palette: chlorophyll green (`--color-primary`) as brand/primary, a
  genomic-data indigo (`--color-accent`) for analysis/variant contexts.
  Risk semantics are separate from the brand palette; "Unknown /
  Insufficient Evidence" is deliberately neutral gray with a dashed ring
  (`RiskBadge`), never a warning color — this encodes the project rule
  that unmatched variants are not treated as harmful.
- Type: Space Grotesk (display/headings), Inter (UI text), IBM Plex Mono
  (variant IDs, chromosome positions, gene symbols) — genomic notation is
  naturally monospace, so the mono face is used anywhere raw genomic data
  appears.
- Signature element: `GenomicTrack`, a mini genome-browser-style track
  (tick marks colored by allele, faded/dashed for low-evidence variants)
  reused on the login hero and the Genomic Analysis page.

## Known gaps / next iteration

- `listDiseaseAssociations` is wired in the API layer but not yet
  rendered on a page — natural next addition to Genomic Analysis once
  Member 3's real evidence records exist.
- No automated tests yet (initial phase) — manual QA per the list
  above.
- Sidebar/Topbar are not collapsible on mobile beyond a simple `hidden
  md:flex` breakpoint; revisit if the demo needs to run on a phone.
