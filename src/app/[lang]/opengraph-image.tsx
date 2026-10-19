import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

export const alt = "JarceDev — Portafolio interactivo 3D y cuatro soluciones digitales";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Native PNG preview for WhatsApp, Facebook, LinkedIn and X.
// Renders at the actual sharing URL; no crawler needs to run WebGL.
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const english = lang === "en";
  const projects = [
    ["01", "FireTrack", "#f46a7b"],
    ["02", "EvacuaPlan Studio", "#74c7e8"],
    ["03", english ? "Accreditations" : "Acreditaciones", "#b2a0ff"],
    ["04", english ? "Hydrants" : "Hidrantes", "#71e5c9"],
  ];
  return new ImageResponse(
    (
      <div style={{
        display: "flex", width: "100%", height: "100%", flexDirection: "column",
        padding: "57px 65px", color: "#f5f7ff",
        background: "linear-gradient(137deg,#091428 0%,#172740 64%,#22264c 100%)",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", fontSize: 34, fontWeight: 800,
              letterSpacing: 5,
            }}>JARCEDEV</div>
          </div>
          <div style={{
            display: "flex", border: "1px solid #7585b0", borderRadius: 30,
            padding: "11px 22px", color: "#c9befa", fontSize: 20,
          }}>{english ? "INTERACTIVE 3D WORLD" : "MUNDO 3D INTERACTIVO"}</div>
        </div>
        <div style={{
          display: "flex", flexDirection: "column", marginTop: 63,
        }}>
          <div style={{ display: "flex", color: "#c1abfa",
            fontSize: 19, fontWeight: 700, letterSpacing: 3 }}>
            {english ? "A SELECTION OF MY WORK" : "UNA MUESTRA DE MI TRABAJO"}
          </div>
          <div style={{
            display: "flex", fontSize: 61, fontWeight: 800, lineHeight: 1.12,
            letterSpacing: -2, marginTop: 19, maxWidth: 1000,
          }}>
            {english ? "Ideas turned into software." : "Ideas que se convierten en software."}
          </div>
          <div style={{
            display: "flex", color: "#c1cddd", fontSize: 25, marginTop: 21,
          }}>
            {english ? "Engineering · Digital products · Costa Rica" :
              "Ingeniería · Productos digitales · Costa Rica"}
          </div>
        </div>
        <div style={{
          display: "flex", gap: 12, marginTop: "auto", width: "100%",
        }}>
          {projects.map(([number, name, color]) => (
            <div key={number} style={{
              display: "flex", alignItems: "center", padding: "16px 17px",
              flex: 1, minWidth: 0, borderRadius: 13,
              background: "#26354d", border: "1px solid #47546c",
            }}>
              <div style={{
                display: "flex", width: 13, height: 13, borderRadius: "50%",
                background: color, marginRight: 11, flexShrink: 0,
              }} />
              <div style={{ display: "flex", fontSize: name.length > 15 ? 17 : 19,
                fontWeight: 700, color: "#edf2ff" }}>{name}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
