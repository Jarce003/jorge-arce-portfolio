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

### Interactive exploration world (preview)

A **playable, original 3D portfolio world** is now implemented on the redesign feature branch. It is inspired by the exploratory interaction pattern of [Bruno Simon](https://bruno-simon.com/) while remaining visually distinct and focused on process improvement.

- Drive an **American-style aerial ladder fire truck** through four project-themed stations.
- Custom lightweight WebGL 2 renderer, without additional runtime packages.
- Perspective camera with an overhead toggle, dedicated touch controls and keyboard driving (WASD or arrow keys).
- Floating station markers, accessible project directory and bilingual project narratives.
- Protected source code and records from private systems never appear in the demo.
- GitHub Actions validates encoding, TypeScript and production builds.

The present world is a **functional geometric prototype**, not the final art-directed edition. Polished custom 3D models, additional collision handling, performance profiling and browser-based gameplay tests are still on the roadmap.

Read the [world concept and development roadmap](docs/jarcedev-3d-concept.md). Production remains unchanged until the preview is approved.

## Primary homepage & mobile controls

The explorable world is now **the first screen** on both language homepages. Visiting `/` resolves to the Spanish world (`/es`); `/en` remains accessible using the language switcher. Traditional project details remain below the world and via dedicated case-study links.

**Phones and tablets** have a dedicated two-thumb steering control, an accelerator pedal and a reverse pedal. These controls support simultaneous multi-touch and cancel safely when a dialog opens. On narrow screens the header, call-to-actions and project navigation adapt to portrait layouts; floating 3D markers are replaced with a horizontal touch-friendly station list. An optional directory works without WebGL 2.

Mobile rendering uses a lower pixel budget, simplified background geometry, a moderate frame cap, and pauses when the world is not visible. Desktop retains WASD/arrow driving plus E to inspect a station, R to reset and C to change camera.

The implementation is responsive in code and passes TypeScript/build checks; **device-level visual and interaction QA should still be completed on representative iOS and Android devices before considering the 3D world visually final**.

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
