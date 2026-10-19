import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JarceDev | Portafolio interactivo 3D de Jorge Arce",
    short_name: "JarceDev",
    description:
      "Explora cuatro aplicaciones creadas para resolver problemas reales en un mundo 3D interactivo.",
    start_url: "/es",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#020617",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
