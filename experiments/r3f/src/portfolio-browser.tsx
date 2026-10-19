import { useEffect } from "react";
import type { ProjectId } from "@/content/projects";
import type { Locale } from "@/lib/i18n";
import { WorldLanguageSwitch } from "./world-language-switch";
import { CompactPortfolio } from "./approved/compact-portfolio";

/** The actual approved JarceDev portfolio, not an independent redesign.
 * Next-only image/link wrappers allow the exact cards and process section to
 * live within the 3D app without opening the old website. */
export function PortfolioBrowser({
  onBack,initialProject="acreditaciones-app",lang,
}:{
  onBack:()=>void;initialProject?:ProjectId;lang:Locale;
}) {
  useEffect(()=>{
    function navigate(event:Event){
      const href=(event as CustomEvent<{href:string}>).detail?.href??"";
      if(href.includes("#mundo")||href==="/"+lang){
        onBack();
      }else if(href.includes("#contacto")||href.includes("#contact")){
        document.getElementById(lang==="es"?"sobre-mi":"about")?.scrollIntoView({behavior:"smooth"});
      }
    }
    window.addEventListener("jarcedev:navigate",navigate);
    return ()=>window.removeEventListener("jarcedev:navigate",navigate);
  },[onBack,lang]);
  return (
    <section className="portfolio-browser" data-testid="inline-portfolio"
      aria-label={lang==="es"?"Mis proyectos y cómo trabajo":"Projects and my approach"}>
      <WorldLanguageSwitch lang={lang} className="portfolio-language-switch"/>
      <CompactPortfolio lang={lang} initialSlug={initialProject}/>
    </section>
  );
}
