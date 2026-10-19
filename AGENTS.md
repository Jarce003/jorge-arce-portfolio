<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## JarceDev product and collaboration

- Reply in **Spanish**. The product owner identifies operational opportunities, functional rules and UX requirements; code is generated with AI assistance. Prefer concise, visual-first explanations.
- The portfolio revolves around a playable **American aerial ladder truck**, four (and growing) project stations, minimal prose and accessible touch/keyboard controls.
- Follow the existing Next.js 16 rules above. React 19, TypeScript, Tailwind and the lightweight WebGL2 renderer currently power the site.
- A **single project catalog** lives in `src/content/projects.ts`; do not duplicate project facts across 3D panels, cards and shareable pages.
- World code is in `src/components/world/`. Engine-neutral types in `world-contract.ts`. Fire and water rescue timing is in `src/lib/world-fire.ts`; press Discover to spray water and extinguish a project station before its panel opens.
- All emergency flashers are red; don't add FDNY or other proprietary department insignia. Fires and water are **fictional stylized effects**, not operational firefighting training.
- Public demos contain **synthetic** data only. Never reveal .env files, keys, real accreditation records or real operational hydrant coordinates.

## Git and environment boundaries

- Work in a feature branch; do not push to, merge or publish `main` without explicit owner approval.
- **No Vercel preview deploys during development**. Run tests and builds locally, reserve Vercel for final production publication.
- Never overwrite user changes: check `git status --porcelain` before edits.
- Windows project path: `C:\Users\jarce\nodeJsProyects\Ejercicios python\jorge-arce-portfolio`. Node 22.
- Don't open localhost or the browser automatically. Give complete, safe PowerShell commands. Stop existing Next.js processes before reinstalling packages to avoid Windows Lightning CSS file locks.
- Checks:
  `npm.cmd run check:encoding`,
  `npm.cmd run check:projects`,
  `npm.cmd run test:demo`,
  `npm.cmd run test:world`,
  `npx.cmd tsc --noEmit`,
  `npm.cmd run build`.
- Optional local QA script: `scripts/validate-local.ps1` (reinstalls dependencies and starts a local production server if checks pass).

## Keep Codex credits for tasks that need Codex

High-value bounded tasks: (1) generate a **Blender Python** script producing a low-poly original ladder truck and one distinct station as GLB assets, with LOD; (2) build a **separate experimental** React Three Fiber v9 scene for comparison, preserving WebGL2 as the default; (3) run local Playwright browser QA and benchmark mobile FPS/memory.

Low-value Codex tasks: small text changes, translating labels, isolated bug fixes, status reports or repeated npm installs. Prefer ChatGPT/GitHub for those. Execute one focused task at a time, avoid duplicate parallel attempts, and inspect `/status` for usage. The owner approves architecture changes and deployment. No unverified claims of production-ready 3D models.
