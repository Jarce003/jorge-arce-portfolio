import { useEffect } from "react";
import type { ProjectId } from "@/content/projects";
import { CompactPortfolio } from "./approved/compact-portfolio";

/** The actual approved JarceDev portfolio, not an independent redesign.
 * Next-only image/link wrappers allow the exact cards and process section to
 * live within the 3D app without opening the old website. */
export function PortfolioBrowser({
  onBack,initialProject="acreditaciones-app",
}:{
  onBack:()=>void;initialProject?:ProjectId;
}) {
  useEffect(()=>{
    function navigate(event:Event){
      const href=(event as CustomEvent<{href:string}>).detail?.href??"";
      if(href.includes("#mundo")||href==="/es"){
        onBack();
      }else if(href.includes("#contacto")||href.includes("#contact")){
        document.getElementById("sobre-mi")?.scrollIntoView({behavior:"smooth"});
      }
    }
    window.addEventListener("jarcedev:navigate",navigate);
    return ()=>window.removeEventListener("jarcedev:navigate",navigate);
  },[onBack]);
  return (
    <section className="portfolio-browser" data-testid="inline-portfolio"
      aria-label="Mis proyectos, casos de estudio y mi proceso">
      <CompactPortfolio lang="es" initialSlug={initialProject}/>
    </section>
  );
}
