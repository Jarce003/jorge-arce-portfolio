import type { ProjectGalleryItem } from "@/content/site-content";
import type { Locale } from "@/lib/i18n";

export const caseStudySlugs = ["firetrack", "evacuaplan-studio"] as const;

export type CaseStudySlug = (typeof caseStudySlugs)[number];

export type CaseStudy = {
  slug: CaseStudySlug;
  metadata: {
    title: string;
    description: string;
  };
  breadcrumb: string;
  status: string;
  title: string;
  subtitle: string;
  introduction: string;
  facts: {
    label: string;
    value: string;
  }[];
  gallery: ProjectGalleryItem[];
  problem: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  solution: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  role: {
    eyebrow: string;
    title: string;
    description: string;
    areas: string[];
  };
  decisions: {
    eyebrow: string;
    title: string;
    description: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  capabilities: {
    eyebrow: string;
    title: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  outcome: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    signals: string[];
  };
  cta: {
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
  };
};

const galleries: Record<CaseStudySlug, ProjectGalleryItem[]> = {
  firetrack: [
    {
      id: "dashboard",
      label: "Panel",
      title: "Panel operativo multiempresa",
      description:
        "Métricas, inventario, estados, inspecciones y alertas reunidos en una vista de seguimiento diario.",
      src: "/projects/firetrack/dashboard-v2.webp",
      alt: "Panel operativo de FireTrack con métricas e inventario de extintores",
    },
    {
      id: "asset",
      label: "Ficha y QR",
      title: "Ficha técnica y acceso mediante QR",
      description:
        "Consulta del estado operativo, controles programados, historial y acceso rápido desde el equipo físico.",
      src: "/projects/firetrack/asset-qr-v2.webp",
      alt: "Ficha de un extintor en FireTrack con etiqueta QR de demostración",
    },
    {
      id: "floor-plan",
      label: "Croquis",
      title: "Ubicación interactiva sobre croquis",
      description:
        "Posicionamiento de equipos en planos multipágina y navegación entre el croquis y cada registro.",
      src: "/projects/firetrack/croquis.webp",
      alt: "Módulo de croquis de FireTrack con extintores ubicados sobre un plano",
    },
    {
      id: "excel-import",
      label: "Migración Excel",
      title: "Importación masiva con validación previa",
      description:
        "Carga de inventarios desde Excel con vista previa, validación de filas y confirmación antes de crear registros.",
      src: "/projects/firetrack/import-excel-v2.webp",
      alt: "Vista previa de importación desde Excel en FireTrack con resultados de validación",
    },
  ],
  "evacuaplan-studio": [
    {
      id: "symbols",
      label: "Símbolos",
      title: "Biblioteca y transformación de símbolos",
      description:
        "Elementos de emergencia que pueden moverse, redimensionarse, rotarse, bloquearse y copiarse.",
      src: "/projects/evacuaplan/symbols.webp",
      alt: "Editor EvacuaPlan con símbolos de emergencia seleccionables",
    },
    {
      id: "multi-select",
      label: "Selección múltiple",
      title: "Edición coordinada de varios objetos",
      description:
        "Selección, desplazamiento y administración conjunta de objetos sin afectar elementos protegidos.",
      src: "/projects/evacuaplan/multi-select.webp",
      alt: "EvacuaPlan Studio con varios objetos seleccionados simultáneamente",
    },
    {
      id: "structure",
      label: "Estructura",
      title: "Paredes, puertas y ventanas",
      description:
        "Herramientas propias para construir y editar la estructura base de cada nivel del croquis.",
      src: "/projects/evacuaplan/structure.webp",
      alt: "EvacuaPlan Studio mostrando una pared con puerta y ventana",
    },
  ],
};

export function isCaseStudySlug(value: string): value is CaseStudySlug {
  return caseStudySlugs.includes(value as CaseStudySlug);
}

export const caseStudies = {
  es: {
    firetrack: {
      slug: "firetrack",
      metadata: {
        title: "FireTrack | Caso de estudio",
        description:
          "Caso de estudio de FireTrack, plataforma SaaS multiempresa para inventario, inspecciones, mantenimiento y trazabilidad de extintores.",
      },
      breadcrumb: "Volver a proyectos",
      status: "En producción",
      title: "FireTrack",
      subtitle:
        "Plataforma SaaS multiempresa para modernizar la gestión, inspección y mantenimiento de extintores.",
      introduction:
        "FireTrack nació para convertir controles operativos dispersos en un sistema centralizado, seguro y trazable. El producto reúne inventario, inspecciones, mantenimiento, usuarios, reportes y acceso mediante QR en una sola aplicación web.",
      facts: [
        { label: "Rol", value: "Diseño de producto y desarrollo Full Stack" },
        { label: "Periodo", value: "2025–actualidad" },
        { label: "Plataforma", value: "Aplicación web responsive" },
        { label: "Estado", value: "Producción y mejora continua" },
      ],
      gallery: galleries.firetrack,
      problem: {
        eyebrow: "El problema",
        title: "Información crítica repartida entre hojas, archivos y controles manuales",
        paragraphs: [
          "La gestión tradicional de extintores suele depender de hojas de cálculo, documentos separados, etiquetas físicas y registros difíciles de mantener actualizados. Esto complica saber qué equipos requieren atención, quién realizó una acción y qué información corresponde a cada empresa.",
          "El reto no era solamente digitalizar un inventario. Era representar reglas operativas reales, mantener trazabilidad y evitar que usuarios de una empresa accedieran a datos de otra.",
        ],
      },
      solution: {
        eyebrow: "La solución",
        title: "Un producto operativo completo, no una colección de pantallas",
        paragraphs: [
          "Diseñé una plataforma multiempresa que centraliza inventario, inspecciones, mantenimiento, servicios técnicos, alertas, reportes y administración de usuarios.",
          "Cada flujo fue desarrollado alrededor de decisiones reales: estados de los equipos, fechas programadas, permisos por rol, aislamiento de datos, auditoría y acceso rápido mediante códigos QR.",
        ],
      },
      role: {
        eyebrow: "Mi participación",
        title: "Responsabilidad de extremo a extremo",
        description:
          "Lideré el producto desde la definición funcional hasta la implementación, validación y despliegue. Esto incluyó decisiones técnicas y de experiencia de usuario, además del mantenimiento continuo.",
        areas: [
          "Levantamiento y priorización de requerimientos",
          "Arquitectura de aplicación y modelado de datos",
          "Frontend, backend y rutas de servidor",
          "Autenticación, roles, RLS y seguridad",
          "Pruebas funcionales y de regresión",
          "Despliegue, monitoreo y correcciones",
        ],
      },
      decisions: {
        eyebrow: "Decisiones de ingeniería",
        title: "La complejidad importante está debajo de la interfaz",
        description:
          "Las decisiones más relevantes se enfocaron en proteger los datos, mantener reglas consistentes y facilitar la evolución del producto.",
        items: [
          {
            title: "Arquitectura multiempresa",
            description:
              "Los registros se organizan por empresa y el acceso se limita mediante permisos y políticas de Row Level Security en PostgreSQL.",
          },
          {
            title: "Autorización en varias capas",
            description:
              "Los permisos no dependen únicamente de ocultar botones; también se validan en operaciones de servidor y acceso a datos.",
          },
          {
            title: "Trazabilidad operativa",
            description:
              "Acciones relevantes, cambios y servicios se reflejan en historiales y registros de auditoría para facilitar seguimiento.",
          },
          {
            title: "Flujos documentales",
            description:
              "La aplicación genera reportes PDF, etiquetas QR e importaciones Excel con validación previa antes de guardar datos.",
          },
          {
            title: "Control de sesiones",
            description:
              "La aplicación incorpora reglas de inactividad, límites absolutos y sincronización entre pestañas para reducir riesgos de sesiones abiertas.",
          },
          {
            title: "Entrega incremental",
            description:
              "Cada cambio pasa por revisión de alcance, validación de encoding, build, pruebas manuales, commit y verificación posterior.",
          },
        ],
      },
      capabilities: {
        eyebrow: "Capacidades principales",
        title: "Un sistema pensado para la operación diaria",
        items: [
          {
            title: "Inventario y empresas",
            description:
              "Administración de equipos, ubicaciones, estados y datos separados por organización.",
          },
          {
            title: "Inspecciones y mantenimiento",
            description:
              "Flujos estructurados para registrar controles, servicios y fechas técnicas programadas.",
          },
          {
            title: "Acceso mediante QR",
            description:
              "Cada equipo puede consultarse rápidamente desde una etiqueta vinculada a su ficha.",
          },
          {
            title: "Reportes y notificaciones",
            description:
              "Generación de PDF, alertas por correo y evidencia para seguimiento operativo.",
          },
          {
            title: "Croquis interactivo",
            description:
              "Ubicación de extintores sobre planos PDF multipágina con navegación hacia cada registro.",
          },
          {
            title: "Roles y auditoría",
            description:
              "Permisos diferenciados, aislamiento multiempresa y trazabilidad de acciones sensibles.",
          },
        ],
      },
      outcome: {
        eyebrow: "Resultado",
        title: "Un producto desplegado y en evolución continua",
        paragraphs: [
          "FireTrack pasó de una necesidad operativa a una aplicación en producción con procesos completos, seguridad por empresa y herramientas para usuarios con responsabilidades distintas.",
          "El proyecto demuestra mi capacidad para analizar un dominio, convertir reglas reales en software y mantener un producto después del lanzamiento.",
        ],
        signals: [
          "Aplicación en producción",
          "4 roles de usuario",
          "Arquitectura multiempresa",
          "QR, PDF, correo y Excel",
          "Validación continua",
        ],
      },
      cta: {
        title: "¿Necesita construir o mejorar un sistema empresarial?",
        description:
          "Podemos identificar una primera etapa, revisar el alcance y definir una solución técnica realista.",
        primaryAction: "Enviar un correo",
        secondaryAction: "Visitar FireTrack",
      },
    },
    "evacuaplan-studio": {
      slug: "evacuaplan-studio",
      metadata: {
        title: "EvacuaPlan Studio | Caso de estudio",
        description:
          "Caso de estudio de EvacuaPlan Studio, editor web interactivo para croquis profesionales de emergencia y evacuación.",
      },
      breadcrumb: "Volver a proyectos",
      status: "En desarrollo activo",
      title: "EvacuaPlan Studio",
      subtitle:
        "Editor web interactivo para crear croquis de emergencia y evacuación con herramientas gráficas especializadas.",
      introduction:
        "EvacuaPlan Studio busca trasladar a la web un proceso que normalmente requiere herramientas gráficas generales o trabajo manual. El objetivo es ofrecer un editor especializado, comprensible y preparado para documentos imprimibles.",
      facts: [
        { label: "Rol", value: "Diseño de producto y desarrollo Full Stack" },
        { label: "Periodo", value: "2026–actualidad" },
        { label: "Plataforma", value: "Escritorio y tablet" },
        { label: "Estado", value: "Prototipo técnico funcional" },
      ],
      gallery: galleries["evacuaplan-studio"],
      problem: {
        eyebrow: "El problema",
        title: "Crear un plano técnico sin convertir al usuario en diseñador gráfico",
        paragraphs: [
          "Los croquis de emergencia combinan estructura arquitectónica, simbología, rutas, textos y requisitos de impresión. Las herramientas genéricas pueden ser demasiado complejas para usuarios que solo necesitan producir un documento claro y normativamente útil.",
          "El desafío consiste en reducir esa complejidad sin perder precisión, capacidad de edición ni compatibilidad con distintos dispositivos de entrada.",
        ],
      },
      solution: {
        eyebrow: "La solución",
        title: "Un editor especializado alrededor del flujo real del documento",
        paragraphs: [
          "Diseñé un lienzo fijo por nivel con herramientas específicas para paredes, puertas, ventanas, áreas, textos, escaleras y símbolos de emergencia.",
          "La interfaz combina edición directa sobre el lienzo con un panel contextual de propiedades, historial de cambios, selección múltiple y controles adaptados a mouse, touch y lápiz.",
        ],
      },
      role: {
        eyebrow: "Mi participación",
        title: "Producto, interacción y arquitectura del editor",
        description:
          "Defino el comportamiento de las herramientas, convierto necesidades operativas en reglas de interacción y desarrollo la arquitectura técnica que mantiene objetos, geometría e historial de cambios.",
        areas: [
          "Definición funcional y experiencia de edición",
          "Modelado de objetos y estado gráfico",
          "Herramientas de dibujo y transformación",
          "Interacción con mouse, touch y Apple Pencil",
          "Pruebas visuales, funcionales y responsive",
          "Git, checkpoints y entregas incrementales",
        ],
      },
      decisions: {
        eyebrow: "Decisiones de ingeniería",
        title: "Un editor gráfico requiere controlar estado, geometría e interacción",
        description:
          "La parte visible es el lienzo; la dificultad real está en conservar relaciones coherentes entre objetos y permitir cambios reversibles.",
        items: [
          {
            title: "Lienzo orientado al documento",
            description:
              "Cada nivel usa un área definida para mantener relación con medidas, orientación y salida final para impresión.",
          },
          {
            title: "Modelo de objetos estructurado",
            description:
              "Paredes, aberturas, áreas, textos y símbolos mantienen propiedades y comportamientos propios.",
          },
          {
            title: "Undo y redo",
            description:
              "Los cambios se gestionan mediante historial para permitir experimentación sin perder el estado anterior.",
          },
          {
            title: "Selección múltiple",
            description:
              "Varios elementos pueden moverse y administrarse juntos respetando objetos bloqueados o protegidos.",
          },
          {
            title: "Interacción multimodal",
            description:
              "Las herramientas se validan con mouse, gestos táctiles, pinch-zoom, desplazamiento con dos dedos y Apple Pencil.",
          },
          {
            title: "Evolución incremental",
            description:
              "Las funciones se incorporan en etapas pequeñas para validar comportamiento antes de ampliar la complejidad.",
          },
        ],
      },
      capabilities: {
        eyebrow: "Capacidades actuales",
        title: "Una base funcional para edición técnica especializada",
        items: [
          {
            title: "Estructura arquitectónica",
            description:
              "Creación y edición de paredes, puertas, ventanas, áreas y escaleras.",
          },
          {
            title: "Simbología de emergencia",
            description:
              "Biblioteca de elementos que pueden moverse, rotarse, escalarse y bloquearse.",
          },
          {
            title: "Edición avanzada",
            description:
              "Selección múltiple, copiar, pegar, bloquear, ocultar, eliminar, deshacer y rehacer.",
          },
          {
            title: "Zoom y navegación",
            description:
              "Acercamiento, ajuste de vista, desplazamiento y comportamiento adaptado a dispositivos táctiles.",
          },
          {
            title: "Gestión por niveles",
            description:
              "Base preparada para trabajar con distintos pisos y vistas relacionadas del edificio.",
          },
          {
            title: "Flujo orientado a PDF",
            description:
              "La estructura del editor se diseña pensando en documentos finales claros y listos para impresión.",
          },
        ],
      },
      outcome: {
        eyebrow: "Estado del proyecto",
        title: "Un prototipo técnico funcional con retos de interacción resueltos",
        paragraphs: [
          "El editor ya permite construir estructuras, insertar símbolos, transformar objetos y trabajar con selección múltiple en escritorio y tablet.",
          "El proyecto continúa en desarrollo y representa una demostración de trabajo con estado complejo, geometría, interfaces gráficas e interacción táctil.",
        ],
        signals: [
          "Desarrollo activo",
          "Mouse, touch y Apple Pencil",
          "Selección múltiple",
          "Undo y redo",
          "Arquitectura por niveles",
        ],
      },
      cta: {
        title: "¿Su proyecto necesita una interfaz compleja o una herramienta especializada?",
        description:
          "Puedo ayudar a convertir reglas de interacción y procesos técnicos en una aplicación web mantenible.",
        primaryAction: "Enviar un correo",
        secondaryAction: "Ver FireTrack",
      },
    },
  },
  en: {
    firetrack: {
      slug: "firetrack",
      metadata: {
        title: "FireTrack | Case study",
        description:
          "Case study of FireTrack, a multi-tenant SaaS platform for fire extinguisher inventory, inspections, maintenance and traceability.",
      },
      breadcrumb: "Back to projects",
      status: "In production",
      title: "FireTrack",
      subtitle:
        "A multi-tenant SaaS platform that modernizes fire extinguisher management, inspections and maintenance.",
      introduction:
        "FireTrack was created to turn scattered operational controls into one centralized, secure and traceable system. The product brings inventory, inspections, maintenance, users, reporting and QR access into a single web application.",
      facts: [
        { label: "Role", value: "Product design and Full Stack development" },
        { label: "Timeline", value: "2025–present" },
        { label: "Platform", value: "Responsive web application" },
        { label: "Status", value: "Production and continuous improvement" },
      ],
      gallery: [
        {
          ...galleries.firetrack[0],
          label: "Dashboard",
          title: "Multi-company operational dashboard",
          description:
            "Metrics, inventory, statuses, inspections and alerts in one daily operational view.",
          alt: "FireTrack operational dashboard with metrics and fire extinguisher inventory",
        },
        {
          ...galleries.firetrack[1],
          label: "Asset and QR",
          title: "Technical record and QR access",
          description:
            "Operational status, scheduled controls, history and fast access from the physical asset.",
          alt: "Fire extinguisher record in FireTrack with a demonstration QR label",
        },
        {
          ...galleries.firetrack[2],
          label: "Floor plan",
          title: "Interactive asset positioning",
          description:
            "Equipment placement on multi-page plans with direct navigation between the plan and each record.",
          alt: "FireTrack floor-plan module with fire extinguishers positioned on a plan",
        },
        {
          ...galleries.firetrack[3],
          label: "Excel migration",
          title: "Bulk import with pre-validation",
          description:
            "Inventory uploads from Excel with row previews, validation results and confirmation before records are created.",
          alt: "FireTrack Excel import preview showing row validation results",
        },
      ],
      problem: {
        eyebrow: "The problem",
        title: "Critical information spread across spreadsheets, files and manual controls",
        paragraphs: [
          "Traditional extinguisher management often relies on spreadsheets, separate documents, physical labels and records that are difficult to keep current. This makes it harder to identify assets that need attention, track who performed an action and separate information by company.",
          "The challenge was not simply to digitize an inventory. It was to represent real operational rules, preserve traceability and prevent users from accessing another company's data.",
        ],
      },
      solution: {
        eyebrow: "The solution",
        title: "A complete operational product, not a collection of screens",
        paragraphs: [
          "I designed a multi-tenant platform that centralizes inventory, inspections, maintenance, technical services, alerts, reports and user administration.",
          "Each workflow was built around real decisions: asset status, scheduled dates, role permissions, data isolation, auditability and fast access through QR codes.",
        ],
      },
      role: {
        eyebrow: "My role",
        title: "End-to-end ownership",
        description:
          "I led the product from functional definition through implementation, validation and deployment. This included technical and UX decisions as well as ongoing maintenance.",
        areas: [
          "Requirements discovery and prioritization",
          "Application architecture and data modeling",
          "Frontend, backend and server routes",
          "Authentication, roles, RLS and security",
          "Functional and regression testing",
          "Deployment, monitoring and fixes",
        ],
      },
      decisions: {
        eyebrow: "Engineering decisions",
        title: "The important complexity lives below the interface",
        description:
          "The most relevant decisions focused on data protection, consistent business rules and the ability to evolve the product safely.",
        items: [
          {
            title: "Multi-tenant architecture",
            description:
              "Records are organized by company and access is restricted through permissions and PostgreSQL Row Level Security policies.",
          },
          {
            title: "Authorization across layers",
            description:
              "Permissions do not depend only on hidden buttons; they are also enforced in server operations and data access.",
          },
          {
            title: "Operational traceability",
            description:
              "Relevant actions, changes and services are reflected in history and audit records for easier follow-up.",
          },
          {
            title: "Document workflows",
            description:
              "The application generates PDF reports, QR labels and validated Excel imports before data is saved.",
          },
          {
            title: "Session control",
            description:
              "The application includes inactivity rules, absolute limits and tab synchronization to reduce the risk of unattended sessions.",
          },
          {
            title: "Incremental delivery",
            description:
              "Each change moves through scope review, encoding validation, build, manual testing, commit and post-deployment verification.",
          },
        ],
      },
      capabilities: {
        eyebrow: "Core capabilities",
        title: "A system designed for daily operations",
        items: [
          {
            title: "Inventory and companies",
            description:
              "Asset, location, status and organization-specific data management.",
          },
          {
            title: "Inspections and maintenance",
            description:
              "Structured workflows for controls, services and scheduled technical dates.",
          },
          {
            title: "QR access",
            description:
              "Each asset can be accessed quickly from a label linked to its record.",
          },
          {
            title: "Reports and notifications",
            description:
              "PDF generation, email alerts and operational evidence for follow-up.",
          },
          {
            title: "Interactive floor plans",
            description:
              "Fire extinguisher placement on multi-page PDFs with navigation to each record.",
          },
          {
            title: "Roles and audit",
            description:
              "Different permission levels, tenant isolation and traceability for sensitive actions.",
          },
        ],
      },
      outcome: {
        eyebrow: "Outcome",
        title: "A deployed product under continuous development",
        paragraphs: [
          "FireTrack evolved from an operational need into a production application with complete workflows, company-level security and tools for users with different responsibilities.",
          "The project demonstrates my ability to understand a domain, translate real rules into software and maintain a product after launch.",
        ],
        signals: [
          "Production application",
          "4 user roles",
          "Multi-tenant architecture",
          "QR, PDF, email and Excel",
          "Continuous validation",
        ],
      },
      cta: {
        title: "Do you need to build or improve a business system?",
        description:
          "We can identify a practical first stage, review the scope and define a realistic technical solution.",
        primaryAction: "Send an email",
        secondaryAction: "Visit FireTrack",
      },
    },
    "evacuaplan-studio": {
      slug: "evacuaplan-studio",
      metadata: {
        title: "EvacuaPlan Studio | Case study",
        description:
          "Case study of EvacuaPlan Studio, an interactive web editor for professional emergency and evacuation plans.",
      },
      breadcrumb: "Back to projects",
      status: "Active development",
      title: "EvacuaPlan Studio",
      subtitle:
        "An interactive web editor for creating emergency and evacuation plans with specialized graphical tools.",
      introduction:
        "EvacuaPlan Studio brings to the web a process that normally requires general-purpose design tools or manual work. The goal is to provide a specialized, understandable editor prepared for printable documents.",
      facts: [
        { label: "Role", value: "Product design and Full Stack development" },
        { label: "Timeline", value: "2026–present" },
        { label: "Platform", value: "Desktop and tablet" },
        { label: "Status", value: "Functional technical prototype" },
      ],
      gallery: [
        {
          ...galleries["evacuaplan-studio"][0],
          label: "Symbols",
          title: "Symbol library and transformation",
          description:
            "Emergency elements that can be moved, resized, rotated, locked and copied.",
          alt: "EvacuaPlan editor with selectable emergency symbols",
        },
        {
          ...galleries["evacuaplan-studio"][1],
          label: "Multi-select",
          title: "Coordinated editing of multiple objects",
          description:
            "Selection, movement and group management without affecting protected elements.",
          alt: "EvacuaPlan Studio with multiple objects selected at the same time",
        },
        {
          ...galleries["evacuaplan-studio"][2],
          label: "Structure",
          title: "Walls, doors and windows",
          description:
            "Custom tools for creating and editing the structural base of each floor plan.",
          alt: "EvacuaPlan Studio showing a wall with a door and window",
        },
      ],
      problem: {
        eyebrow: "The problem",
        title: "Create a technical plan without turning the user into a graphic designer",
        paragraphs: [
          "Emergency plans combine architectural structure, symbols, routes, text and print requirements. General-purpose tools can be too complex for users who only need to produce a clear and useful document.",
          "The challenge is to reduce that complexity without losing precision, editing capability or compatibility with different input devices.",
        ],
      },
      solution: {
        eyebrow: "The solution",
        title: "A specialized editor built around the document workflow",
        paragraphs: [
          "I designed a fixed canvas per floor with dedicated tools for walls, doors, windows, areas, text, stairs and emergency symbols.",
          "The interface combines direct canvas editing with a contextual properties panel, history controls, multi-selection and interactions adapted to mouse, touch and stylus input.",
        ],
      },
      role: {
        eyebrow: "My role",
        title: "Product, interaction and editor architecture",
        description:
          "I define tool behavior, convert operational needs into interaction rules and develop the technical architecture that manages objects, geometry and change history.",
        areas: [
          "Functional definition and editing experience",
          "Object modeling and graphical state",
          "Drawing and transformation tools",
          "Mouse, touch and Apple Pencil interaction",
          "Visual, functional and responsive testing",
          "Git, checkpoints and incremental releases",
        ],
      },
      decisions: {
        eyebrow: "Engineering decisions",
        title: "A graphical editor requires control over state, geometry and interaction",
        description:
          "The visible part is the canvas; the real difficulty is preserving coherent relationships between objects and allowing reversible changes.",
        items: [
          {
            title: "Document-oriented canvas",
            description:
              "Each floor uses a defined area to preserve scale, orientation and the relationship with the final printable output.",
          },
          {
            title: "Structured object model",
            description:
              "Walls, openings, areas, text and symbols maintain their own properties and behaviors.",
          },
          {
            title: "Undo and redo",
            description:
              "Changes are managed through history so users can experiment without losing the previous state.",
          },
          {
            title: "Multi-selection",
            description:
              "Several elements can be moved and managed together while respecting locked or protected objects.",
          },
          {
            title: "Multi-modal interaction",
            description:
              "Tools are validated with mouse, touch gestures, pinch zoom, two-finger pan and Apple Pencil.",
          },
          {
            title: "Incremental evolution",
            description:
              "Features are introduced in small stages to validate behavior before expanding complexity.",
          },
        ],
      },
      capabilities: {
        eyebrow: "Current capabilities",
        title: "A functional foundation for specialized technical editing",
        items: [
          {
            title: "Architectural structure",
            description:
              "Creation and editing of walls, doors, windows, areas and stairs.",
          },
          {
            title: "Emergency symbols",
            description:
              "A library of elements that can be moved, rotated, scaled and locked.",
          },
          {
            title: "Advanced editing",
            description:
              "Multi-select, copy, paste, lock, hide, delete, undo and redo.",
          },
          {
            title: "Zoom and navigation",
            description:
              "Zoom, fit-to-view, panning and behavior adapted to touch devices.",
          },
          {
            title: "Floor management",
            description:
              "A foundation prepared for separate levels and related views of a building.",
          },
          {
            title: "PDF-oriented workflow",
            description:
              "The editor structure is designed around clear final documents prepared for printing.",
          },
        ],
      },
      outcome: {
        eyebrow: "Project status",
        title: "A functional technical prototype with complex interactions solved",
        paragraphs: [
          "The editor already supports structures, symbols, object transformation and multi-selection on desktop and tablet.",
          "The project remains in active development and demonstrates work with complex state, geometry, graphical interfaces and touch interaction.",
        ],
        signals: [
          "Active development",
          "Mouse, touch and Apple Pencil",
          "Multi-selection",
          "Undo and redo",
          "Multi-floor architecture",
        ],
      },
      cta: {
        title: "Does your project need a complex interface or specialized tool?",
        description:
          "I can help translate interaction rules and technical processes into a maintainable web application.",
        primaryAction: "Send an email",
        secondaryAction: "View FireTrack",
      },
    },
  },
} satisfies Record<Locale, Record<CaseStudySlug, CaseStudy>>;
