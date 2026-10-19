import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

// Bundled Three Fiber experience shares Next.js public models/previews.
// Avoid copying public recursively into itself and keep the output replaceable.
const root=process.cwd();
const source=resolve(root,"experiments/r3f/dist");
const destination=resolve(root,"public/experience");
await stat(resolve(source,"index.html"));
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});
await cp(source,destination,{recursive:true});
const html=await readFile(resolve(destination,"index.html"),"utf8");
if(!html.includes("/experience/assets/")) {
  throw new Error("Three Fiber build paths are not rooted at /experience/assets/");
}
console.log("JarceDev interactive 3D experience staged at public/experience/");
