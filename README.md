# JarceDev — Jorge Arce Solano

Portfolio: [Español](https://www.jarcedev.com/es) · [English](https://www.jarcedev.com/en)

## Professional focus

I am a **Systems Engineer focused on process improvement, digital product definition and AI-assisted software creation**.

My contribution is to study real-world operations, identify improvement opportunities, define product requirements and business rules, evaluate options and validate implementations. **ChatGPT and other AI tools perform the coding and assist with architecture and testing.** I coordinate decisions, execute guided checks, test real workflows, identify problems and approve iterations. I do not claim to have hand-written AI-generated code.

## Case studies

### FireTrack

A multi-company fire extinguisher management product covering inventory, inspections, maintenance, QR access, alerts, PDF reports and Excel imports.

**My role:** identifying the operational need, defining business rules and permissions, prioritizing capabilities, guiding AI-assisted implementation and validating the workflows.

### EvacuaPlan Studio

A specialized browser-based emergency plan editor with object manipulation and interactions designed around real documentation workflows.

**My role:** identifying the need for dedicated planning tools, defining features and expected behavior, validating usability and managing revisions with AI assistance.

### Acreditaciones

A private operator accreditation system covering historical reconciliation, qualification cycles, assessments and evaluation planning. The project uses Next.js and PostgreSQL, plus Python, FastAPI, DuckDB and Google OR-Tools for analytics and planning.

**My role:** interpreting domain rules, defining how qualifications expire and renew, managing implementation priorities, testing results and validating the system. The public portfolio demo uses **synthetic data only**.

### Hidrantes

QR-first public hydrant map with optional device location, GPM lookup and private editor. The app is developed; external public-deployment status is not claimed as verified.

**My role:** defining field-use needs, mobile lookup and protected-editing workflows, coordinating implementation and testing the experience. The portfolio map has fictional locations only.

## Tools used in the products

Next.js, React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Node.js, Python, FastAPI, DuckDB, Google OR-Tools and generative AI.

This is a list of **technologies used across my products**, not a claim that I manually write production code in each language.

## Portfolio implementation

The website itself is built with Next.js 16, React 19, TypeScript and Tailwind CSS 4, deployed to Vercel. It includes:

- Spanish and English navigation and content
- Responsive project presentations and detailed technical case studies
- Interactive product demos (using sanitized or fictional information)
- Protected contact form and links to professional profiles
- CV downloads, Open Graph tags, sitemap and accessible navigation

### Immersive 3D world: primary homepage

The JarceDev homepage at `/es` and `/en` is now **exclusively the playable 3D world**, featuring an original American-style aerial ladder truck. Visiting `/` redirects to `/es`.

The extended information previously appearing below the world has been **replaced by a compact interactive** `/es/portfolio` and `/en/portfolio` experience. Four clickable visual project tiles, a brief four-step process selector and a one-line profile link to stand-alone case studies at `/[lang]/projects/[slug]`. The navigation menu and contact links now point to those routes, so accessibility and search discovery remain available without entering WebGL.

**Minimal mobile HUD:** the immersive world takes the entire available viewport beneath the global navigation. The long hero text, description, main action row and persistent project strip are gone on phones. The visible controls are:
- 🚨 **Luces / Lights** toggles working headlights, alternating **red-only** emergency beacons and their luminous reflections. Desktop shortcut: **L**. Motion-sensitive users see static lights without strobing.
- ◈ **Vista / View** switches between truck-following and overhead cameras. Shortcut **C**.
- ▦ **Estaciones / Stations** opens an optional project-selection drawer. Shortcut **M**.
- ⓘ **Info** opens a short explanation, directions and the professional profile link.
- Two-thumb touch steering and accelerator/reverse pedals stay at the bottom. On mobile, redundant control instructions are visually hidden and retained as accessible names.

Keyboard driving uses **WASD or arrow keys**, **E** for nearby stations and **R** to reset. WebGL 2 failures offer a usable directory of projects rather than a broken scene.

The original lightweight WebGL2 renderer dynamically lowers the mobile pixel ratio and detail. Content remains in HTML routes and is not locked inside 3D canvases. The 3D truck and surroundings are still **original geometric prototypes**, not finished production-quality custom 3D artwork.

GitHub Actions checks encoding, TypeScript and production builds, and Vercel provides isolated preview deployments. Real-device appearance, glare/brightness and two-thumb comfort still need visual testing before we call the experience final.

Read the [3D concept and development roadmap](docs/jarcedev-3d-concept.md).

## Public interactive AI demonstration

Acreditaciones includes a private assistant based on AI query compilation and a validated, rule-driven data engine. The public portfolio demonstrates the **experience** through four interactive synthetic scenarios: priorities, planning capacity, historical failure counts and accreditation validity.

**Important:** this front-end demo is a deterministic educational simulation, not a live Gemini/OpenAI endpoint or a connection to confidential accreditation records. This distinction is clearly visible to visitors. New free-text questions outside the examples are not silently presented as live model results.

## Contact experience

A floating “Hablemos / Let's talk” action opens a focused dialog. Visitors choose an inquiry type, optionally describe the situation and then select either a prefilled WhatsApp handoff or the existing protected email form with Cloudflare Turnstile. Nothing is submitted automatically.

## Development

```bash
npm install
npm run check:encoding
npm run build
npm run dev
```

Visit http://localhost:3000/es or http://localhost:3000/en.

## Privacy and source

Project implementations such as FireTrack, EvacuaPlan Studio and Acreditaciones may reside in private repositories. Only public-friendly narratives, fictional demos and sanitized visuals belong in this portfolio.

## License

Copyright © 2026 Jorge Arce Solano. All rights reserved.

Unless otherwise stated, the repository and visuals are available for review; copying, redistribution or modification is not authorized.
