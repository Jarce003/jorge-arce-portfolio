import { useState } from "react";
import { getProjects, type ProjectId } from "@/content/projects";
import { AcreditacionesDemo } from "./acreditaciones-demo";

const projects=getProjects("es");
const method=[
  {title:"Observar",detail:"Entender el problema y cómo funciona la operación."},
  {title:"Detectar",detail:"Identificar oportunidades reales de mejora."},
  {title:"Definir",detail:"Diseñar y construir una solución con asistencia de IA."},
  {title:"Validar",detail:"Probar la solución, corregirla y verificar el resultado."},
];

/** The approved small JarceDev project cards, hosted alongside the 3D world.
 * Navigation no longer escapes to the deployed legacy website. */
export function PortfolioBrowser({onBack}:{onBack:()=>void}){
  const [selectedSlug,setSelectedSlug]=useState<ProjectId>("acreditaciones-app");
  const selected=projects.find(project=>project.slug===selectedSlug)??projects[0];
  const [methodStep,setMethodStep]=useState(0);
  return (
    <section className="portfolio-browser" aria-label="Mis proyectos y casos de estudio" data-testid="inline-portfolio">
      <div className="portfolio-browser-inner">
        <header className="browser-top">
          <button type="button" className="browser-back" onClick={onBack}>
            ← Volver al mundo 3D
          </button>
          <span>JARCEDEV · SOLUCIONES</span>
        </header>
        <div className="browser-intro">
          <span className="eyebrow">PORTAFOLIO DE PROYECTOS</span>
          <h1>De problemas a productos.</h1>
          <p>Analizo procesos, defino soluciones y valido resultados con desarrollo asistido por IA.</p>
        </div>
        <div className="browser-section-title">
          <h2>MIS PROYECTOS</h2>
          <span>Selecciona una tarjeta para conocerla</span>
        </div>
        <div className="browser-cards" aria-label="Seleccionar proyecto">
          {projects.map(project=>(
            <button key={project.slug} type="button" onClick={()=>setSelectedSlug(project.slug)}
              aria-pressed={selected.slug===project.slug}
              className={selected.slug===project.slug?"browser-card selected":"browser-card"}>
              <span className="browser-card-art">
                <img src={project.preview} alt={project.previewAlt} loading="lazy"/>
              </span>
              <span className="browser-card-title">
                <span aria-hidden="true">{project.icon}</span>
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.category}</small>
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="browser-case" key={selected.slug}>
          <article className="browser-summary" aria-label={"Caso "+selected.title}>
            <span className="eyebrow">{selected.category}</span>
            <h2>{selected.title}</h2>
            <div className="browser-problem">
              <strong>EL PROBLEMA</strong>
              <p>{selected.problem}</p>
            </div>
            <div className="browser-solution">
              <strong>LA SOLUCIÓN</strong>
              <p>{selected.solution}</p>
            </div>
            <div className="browser-techs" aria-label="Tecnologías">
              {selected.technologies.map(value=><span key={value}>{value}</span>)}
            </div>
            <p className="browser-status">{selected.status}</p>
          </article>
          <div className="browser-demo" aria-label={"Vista interactiva de "+selected.title}>
            {selected.demo==="acreditaciones-ai"
              ? <AcreditacionesDemo lang="es" compact/>
              : <div className="browser-case-art">
                  <img src={selected.preview} alt={selected.previewAlt} loading="lazy"/>
                  <p>Vista del proyecto</p>
                </div>}
          </div>
        </div>
        <div className="browser-method">
          <div>
            <span className="eyebrow">MI PROCESO</span>
            <p>Observo, defino y valido soluciones. La implementación se apoya en herramientas de IA.</p>
          </div>
          <div className="browser-method-tabs">
            {method.map((item,index)=>(
              <button type="button" key={item.title} onClick={()=>setMethodStep(index)}
                aria-pressed={methodStep===index}>
                {index+1}. {item.title}
              </button>
            ))}
            <p aria-live="polite">{method[methodStep].detail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
