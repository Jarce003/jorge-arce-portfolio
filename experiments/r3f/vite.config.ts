import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// Reuse the original JarceDev project's public/ assets. The experiment is
// completely isolated and cannot change Next.js or Vercel builds.
export default defineConfig(({command})=>({
  // Next.js already serves /models and /projects in production. Only Vite's
  // JS, CSS and HTML belong inside /experience/; never copy public into itself.
  base:command==="build"?"/experience/":"/",
  publicDir:command==="serve"
    ?fileURLToPath(new URL("../../public",import.meta.url)):false,
  resolve:{alias:{"@":fileURLToPath(new URL("../../src",import.meta.url))}},
  css:{postcss:{plugins:[]}},
  server:{host:"127.0.0.1",port:4174,strictPort:true},
  preview:{host:"127.0.0.1",port:4174,strictPort:true},
  build:{outDir:"dist",emptyOutDir:true},
}));
