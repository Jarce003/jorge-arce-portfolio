import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// Reuse the original JarceDev project's public/ assets. The experiment is
// completely isolated and cannot change Next.js or Vercel builds.
export default defineConfig({
  publicDir: fileURLToPath(new URL("../../public", import.meta.url)),
  server: { host: "127.0.0.1", port: 4174, strictPort: true },
  preview: { host: "127.0.0.1", port: 4174, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
