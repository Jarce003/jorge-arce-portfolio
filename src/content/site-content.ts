import type { Locale } from "@/lib/i18n";

export type ProjectVisualVariant = "firetrack" | "evacuaplan";

export type ProjectGalleryItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  src: string;
  alt: string;
};

type NavigationItem = {
  label: string;
  href: string;
};

type Project = {
  slug: "firetrack" | "evacuaplan-studio";
  caseStudyLabel: string;
  title: string;
  status: string;
  description: string;
  highlights: string[];
  technologies: string[];
  gallery: ProjectGalleryItem[];
  externalUrl?: string;
  externalLabel?: string;
};

type Service = {
  number: string;
  title: string;
  description: string;
  details: string;
};

type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type SiteContent = {
  metadata: {
    title: string;
    description: string;
  };
  navigation: NavigationItem[];
  header: {
    role: string;
    contact: string;
  };
  hero: {
    availability: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    technologiesLabel: string;
    technologies: string[];
    metrics: {
      value: string;
      label: string;
    }[];
  };
  projectsSection: {
    eyebrow: string;
    title: string;
    description: string;
    projects: Project[];
  };
  servicesSection: {
    eyebrow: string;
    title: string;
    description: string;
    services: Service[];
  };
  processSection: {
    eyebrow: string;
    title: string;
    description: string;
    steps: ProcessStep[];
  };
  valueSection: {
    eyebrow: string;
    title: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  aiSection: {
    eyebrow: string;
    title: string;
    description: string;
    uses: string[];
    guardrailsTitle: string;
    guardrails: string[];
  };
  aboutSection: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    facts: string[];
    linkedinLabel: string;
  };
  contactSection: {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
  };
  footer: {
    description: string;
    rights: string;
  };
};

export const siteContent = {
  es: {
    metadata: {
      title: "Jorge Arce | Full Stack Software Engineer",
      description:
        "Desarrollo de aplicaciones web, plataformas SaaS y soluciones empresariales con Next.js, React, TypeScript, PostgreSQL y Supabase.",
    },
    navigation: [
      { label: "Proyectos", href: "#proyectos" },
      { label: "Servicios", href: "#servicios" },
      { label: "Proceso", href: "#proceso" },
      { label: "Sobre mí", href: "#sobre-mi" },
    ],
    header: {
      role: "Full Stack Software Engineer",
      contact: "Contactarme",
    },
    hero: {
      availability:
        "Disponible para proyectos freelance, contratos y oportunidades remotas",
      title:
        "Convierto procesos complejos en soluciones digitales claras, eficientes y confiables.",
      description:
        "Combino análisis de procesos, lógica de negocio y desarrollo Full Stack para identificar oportunidades de mejora, diseñar flujos más eficientes y construir soluciones que funcionen en la operación real.",
      primaryAction: "Explorar proyectos",
      secondaryAction: "Hablemos de su proyecto",
      technologiesLabel: "Tecnologías principales",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Supabase",
      ],
      metrics: [
        { value: "2", label: "productos propios" },
        { value: "Ciclo completo", label: "de requisitos a producción" },
        { value: "C1", label: "nivel de inglés" },
      ],
    },
    projectsSection: {
      eyebrow: "Trabajo seleccionado",
      title: "De problemas operativos a productos digitales",
      description:
        "Casos donde analizo necesidades reales, estructuro procesos y reglas de negocio, y llevo la solución hasta desarrollo, pruebas, seguridad y despliegue.",
      projects: [
        {
          slug: "firetrack",
          caseStudyLabel: "Ver caso de estudio",
          title: "FireTrack",
          status: "En producción",
          description:
            "Solución SaaS creada al identificar oportunidades para mejorar la gestión tradicional de inventario, inspecciones, mantenimiento y trazabilidad de extintores.",
          highlights: [
            "Análisis del flujo operativo y traducción de necesidades reales en reglas, permisos y procesos digitales.",
            "Arquitectura multiempresa con autenticación, roles, aislamiento de datos y trazabilidad.",
            "QR, reportes PDF, alertas, auditoría e importación Excel integrados al flujo diario.",
          ],
          technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Supabase",
            "PostgreSQL",
            "Vercel",
          ],
          gallery: [
            {
              id: "dashboard",
              label: "Panel",
              title: "Panel operativo multiempresa",
              description:
                "Métricas, inventario, estados, inspecciones y alertas reunidos en una vista de seguimiento diario.",
              src: "/projects/firetrack/dashboard.webp",
              alt: "Panel operativo de FireTrack con métricas e inventario de extintores",
            },
            {
              id: "asset",
              label: "Ficha y QR",
              title: "Ficha técnica y acceso mediante QR",
              description:
                "Consulta del estado operativo, controles programados, historial y acceso rápido desde el equipo físico.",
              src: "/projects/firetrack/asset-qr.webp",
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
          ],
          externalUrl: "https://firetrackcr.com",
          externalLabel: "Visitar FireTrack",
        },
        {
          slug: "evacuaplan-studio",
          caseStudyLabel: "Ver caso de estudio",
          title: "EvacuaPlan Studio",
          status: "En desarrollo activo",
          description:
            "Herramienta web que traduce requisitos de planificación de emergencias en un flujo especializado para crear croquis profesionales.",
          highlights: [
            "Conversión de requisitos técnicos y operativos en herramientas específicas de edición.",
            "Selección, rotación, agrupación, bloqueo, copia y edición avanzada de objetos.",
            "Interacción con mouse, pantallas táctiles, iPad y Apple Pencil.",
          ],
          technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Konva",
            "Tailwind CSS",
          ],
          gallery: [
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
        },
      ],
    },
    servicesSection: {
      eyebrow: "Servicios",
      title: "Análisis, mejora e implementación",
      description:
        "Puedo intervenir desde la comprensión del proceso hasta la construcción y validación de la solución, combinando visión operativa y capacidad técnica.",
      services: [
        {
          number: "01",
          title: "Análisis y mejora de procesos",
          description:
            "Reviso flujos actuales, necesidades de usuarios, cuellos de botella, riesgos y oportunidades de simplificación o automatización.",
          details:
            "Análisis · Requerimientos · Flujos · Reglas de negocio",
        },
        {
          number: "02",
          title: "Automatización y soluciones a medida",
          description:
            "Convierto procesos definidos en herramientas internas, aplicaciones web, integraciones y flujos basados en datos.",
          details: "Next.js · TypeScript · Node.js · REST APIs · PostgreSQL",
        },
        {
          number: "03",
          title: "Validación y mejora continua",
          description:
            "Pruebo flujos, reproduzco errores, valido reglas y ajusto la solución a partir del comportamiento real de usuarios y operación.",
          details: "Web · Móvil · iPad · Roles · Permisos · UX",
        },
      ],
    },
    processSection: {
      eyebrow: "Forma de trabajo",
      title: "De una necesidad operativa a una solución funcional",
      description:
        "Primero entiendo cómo funciona el proceso hoy; después identifico dónde pierde eficiencia y defino una mejora antes de decidir qué tecnología conviene.",
      steps: [
        {
          number: "01",
          title: "Comprender",
          description:
            "Entiendo cómo funciona el proceso hoy, quién lo ejecuta, qué reglas aplica y qué resultado necesita.",
        },
        {
          number: "02",
          title: "Diagnosticar",
          description:
            "Identifico cuellos de botella, duplicaciones, riesgos, pérdidas de información y oportunidades de simplificación o automatización.",
        },
        {
          number: "03",
          title: "Diseñar e implementar",
          description:
            "Defino el flujo mejorado y construyo la solución técnica cuando la tecnología aporta valor.",
        },
        {
          number: "04",
          title: "Validar y mejorar",
          description:
            "Pruebo escenarios reales, verifico seguridad y usabilidad, y ajusto el proceso según los resultados.",
        },
      ],
    },
    valueSection: {
      eyebrow: "Valor profesional",
      title: "Entender el problema antes de construir la solución",
      items: [
        {
          title: "Mentalidad de mejora",
          description:
            "Busco comprender por qué existe cada paso, qué valor aporta y dónde el proceso puede ser más simple, claro o eficiente.",
        },
        {
          title: "Puente entre operación y tecnología",
          description:
            "Traduzco necesidades de usuarios y negocio en flujos, reglas de datos y decisiones técnicas comprensibles.",
        },
        {
          title: "Capacidad de ejecución",
          description:
            "No me quedo en la recomendación: puedo llevar la solución a interfaz, backend, base de datos, pruebas y despliegue.",
        },
        {
          title: "Trabajo colaborativo",
          description:
            "Construyo relaciones de confianza para que las personas comuniquen problemas reales y participen en soluciones que puedan adoptar.",
        },
      ],
    },
    aiSection: {
      eyebrow: "Flujo de desarrollo",
      title: "Uso IA para avanzar más rápido, sin delegar la calidad",
      description:
        "Las herramientas de IA forman parte de mi proceso para explorar arquitectura, acelerar implementación, depurar y preparar pruebas. El criterio técnico y la responsabilidad sobre cada entrega siguen siendo míos.",
      uses: [
        "Análisis de requerimientos y alternativas",
        "Implementación y refactorización",
        "Depuración y revisión de errores",
        "Diseño de pruebas y documentación",
      ],
      guardrailsTitle: "La responsabilidad sigue siendo humana",
      guardrails: [
        "Reviso y adapto cada cambio al contexto del proyecto.",
        "Valido seguridad, permisos y acceso a datos.",
        "Ejecuto checks de encoding, builds y pruebas funcionales.",
        "Verifico el comportamiento antes y después del despliegue.",
      ],
    },
    aboutSection: {
      eyebrow: "Sobre mí",
      title: "Ingeniería, operación y mejora de procesos en un mismo perfil",
      paragraphs: [
        "Soy Jorge Arce, Ingeniero en Sistemas graduado de la Universidad Autónoma de Centro América con la distinción Summa Cum Laude Probatus.",
        "Además del desarrollo de software, trabajo en atención de emergencias desde 2014 y he asumido responsabilidades de coordinación, instrucción y mejora de flujos en entornos donde la claridad, el cumplimiento y la toma de decisiones son importantes.",
        "FireTrack resume bien mi forma de trabajar: identifiqué oportunidades de mejora en un proceso operativo, estructuré sus reglas y necesidades, y las convertí en una solución SaaS en producción.",
      ],
      facts: [
        "Costa Rica",
        "Español nativo",
        "Inglés C1",
        "Disponible para trabajo remoto",
      ],
      linkedinLabel: "Ver perfil de LinkedIn",
    },
    contactSection: {
      eyebrow: "Contacto",
      title: "¿Tiene un proyecto, una vacante o un sistema que necesita mejorar?",
      description:
        "Cuénteme brevemente qué necesita. Podemos identificar una primera etapa, valorar el alcance y definir una solución realista.",
      primaryAction: "Enviar un correo",
      secondaryAction: "Conectar en LinkedIn",
    },
    footer: {
      description:
        "Systems Engineer y Full Stack Developer enfocado en mejora de procesos, automatización y soluciones digitales.",
      rights: "Todos los derechos reservados.",
    },
  },
  en: {
    metadata: {
      title: "Jorge Arce | Full Stack Software Engineer",
      description:
        "Web applications, SaaS platforms and business software built with Next.js, React, TypeScript, PostgreSQL and Supabase.",
    },
    navigation: [
      { label: "Projects", href: "#projects" },
      { label: "Services", href: "#services" },
      { label: "Process", href: "#process" },
      { label: "About", href: "#about" },
    ],
    header: {
      role: "Full Stack Software Engineer",
      contact: "Contact me",
    },
    hero: {
      availability:
        "Available for freelance projects, contracts and remote opportunities",
      title:
        "I turn complex processes into clear, efficient and reliable digital solutions.",
      description:
        "I combine process analysis, business logic and Full Stack development to identify improvement opportunities, design more efficient workflows and build solutions that work in real operations.",
      primaryAction: "Explore projects",
      secondaryAction: "Let’s discuss your project",
      technologiesLabel: "Technical stack",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Supabase",
      ],
      metrics: [
        { value: "2", label: "independent products" },
        { value: "End-to-end", label: "requirements to production" },
        { value: "C1", label: "English proficiency" },
      ],
    },
    projectsSection: {
      eyebrow: "Selected work",
      title: "From operational problems to digital products",
      description:
        "Cases where I analyze real needs, structure processes and business rules, and take the solution through development, testing, security and deployment.",
      projects: [
        {
          slug: "firetrack",
          caseStudyLabel: "View case study",
          title: "FireTrack",
          status: "In production",
          description:
            "A SaaS solution created after identifying opportunities to improve traditional fire-extinguisher inventory, inspection, maintenance and traceability processes.",
          highlights: [
            "Analysis of the operational workflow and translation of real needs into rules, permissions and digital processes.",
            "Multi-company architecture with authentication, roles, data isolation and traceability.",
            "QR, PDF reporting, alerts, audit records and Excel imports integrated into the daily workflow.",
          ],
          technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Supabase",
            "PostgreSQL",
            "Vercel",
          ],
          gallery: [
            {
              id: "dashboard",
              label: "Dashboard",
              title: "Multi-company operational dashboard",
              description:
                "Metrics, inventory, statuses, inspections and alerts brought together for daily operational monitoring.",
              src: "/projects/firetrack/dashboard.webp",
              alt: "FireTrack operational dashboard with extinguisher inventory metrics",
            },
            {
              id: "asset",
              label: "Asset and QR",
              title: "Technical record and QR access",
              description:
                "Operational status, scheduled controls, history and fast access from the physical equipment.",
              src: "/projects/firetrack/asset-qr.webp",
              alt: "FireTrack extinguisher record with a safe demonstration QR label",
            },
            {
              id: "floor-plan",
              label: "Floor plan",
              title: "Interactive equipment positioning",
              description:
                "Equipment placement on multi-page plans with navigation between the floor plan and each asset record.",
              src: "/projects/firetrack/croquis.webp",
              alt: "FireTrack floor-plan module with extinguishers positioned on a building plan",
            },
          ],
          externalUrl: "https://firetrackcr.com",
          externalLabel: "Visit FireTrack",
        },
        {
          slug: "evacuaplan-studio",
          caseStudyLabel: "View case study",
          title: "EvacuaPlan Studio",
          status: "Active development",
          description:
            "A web tool that translates emergency-planning requirements into a specialized workflow for creating professional evacuation plans.",
          highlights: [
            "Translation of technical and operational requirements into specialized editing tools.",
            "Selection, rotation, grouping, locking, copying and advanced object editing.",
            "Mouse, touchscreen, iPad and Apple Pencil interaction.",
          ],
          technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Konva",
            "Tailwind CSS",
          ],
          gallery: [
            {
              id: "symbols",
              label: "Symbols",
              title: "Emergency symbol library and transformation",
              description:
                "Emergency objects that can be moved, resized, rotated, locked and copied.",
              src: "/projects/evacuaplan/symbols.webp",
              alt: "EvacuaPlan editor with selectable emergency symbols",
            },
            {
              id: "multi-select",
              label: "Multi-select",
              title: "Coordinated editing of multiple objects",
              description:
                "Selection, movement and management of several objects without affecting protected elements.",
              src: "/projects/evacuaplan/multi-select.webp",
              alt: "EvacuaPlan Studio with several objects selected at the same time",
            },
            {
              id: "structure",
              label: "Structure",
              title: "Walls, doors and windows",
              description:
                "Custom tools for building and editing the structural foundation of each plan level.",
              src: "/projects/evacuaplan/structure.webp",
              alt: "EvacuaPlan Studio showing a wall with a door and window",
            },
          ],
        },
      ],
    },
    servicesSection: {
      eyebrow: "Services",
      title: "Analysis, improvement and implementation",
      description:
        "I can contribute from understanding the process through building and validating the solution, combining operational perspective with technical execution.",
      services: [
        {
          number: "01",
          title: "Process analysis and improvement",
          description:
            "I review current workflows, user needs, bottlenecks, risks and opportunities for simplification or automation.",
          details:
            "Process analysis · Requirements · Workflow design · Business rules",
        },
        {
          number: "02",
          title: "Automation and custom solutions",
          description:
            "I turn defined processes into internal tools, web applications, integrations and data-driven workflows.",
          details: "Next.js · TypeScript · Node.js · REST APIs · PostgreSQL",
        },
        {
          number: "03",
          title: "Validation and continuous improvement",
          description:
            "I test workflows, reproduce defects, validate rules and refine solutions based on real user and operational behavior.",
          details: "Web · Mobile · iPad · Roles · Permissions · UX",
        },
      ],
    },
    processSection: {
      eyebrow: "Working process",
      title: "From an operational need to a functional solution",
      description:
        "I first understand how the process works today, then identify where it loses efficiency and define an improvement before deciding which technology makes sense.",
      steps: [
        {
          number: "01",
          title: "Understand",
          description:
            "I understand how the process works today, who performs it, which rules apply and what outcome is needed.",
        },
        {
          number: "02",
          title: "Diagnose",
          description:
            "I identify bottlenecks, duplicated effort, risks, information gaps and opportunities for simplification or automation.",
        },
        {
          number: "03",
          title: "Design and implement",
          description:
            "I define the improved workflow and build the technical solution when technology adds real value.",
        },
        {
          number: "04",
          title: "Validate and improve",
          description:
            "I test real scenarios, verify security and usability, and refine the process based on results.",
        },
      ],
    },
    valueSection: {
      eyebrow: "Professional value",
      title: "Understand the problem before building the solution",
      items: [
        {
          title: "Improvement mindset",
          description:
            "I look at why each step exists, what value it adds and where a process can become simpler, clearer or more efficient.",
        },
        {
          title: "Bridge between operations and technology",
          description:
            "I translate user and business needs into workflows, data rules and understandable technical decisions.",
        },
        {
          title: "Execution capability",
          description:
            "I do not stop at recommendations: I can take a solution through frontend, backend, databases, testing and deployment.",
        },
        {
          title: "Collaborative work",
          description:
            "I build trust so people can communicate real problems openly and contribute to solutions they can actually adopt.",
        },
      ],
    },
    aiSection: {
      eyebrow: "Development workflow",
      title: "I use AI to move faster without delegating quality",
      description:
        "AI tools are part of my workflow for architecture exploration, implementation, debugging and test preparation. Technical judgment and responsibility for every delivery remain mine.",
      uses: [
        "Requirements analysis and solution exploration",
        "Implementation and refactoring",
        "Debugging and issue review",
        "Test design and documentation",
      ],
      guardrailsTitle: "Human ownership remains essential",
      guardrails: [
        "I review and adapt every change to the project context.",
        "I validate security, permissions and data access.",
        "I run encoding checks, builds and functional tests.",
        "I verify behavior before and after deployment.",
      ],
    },
    aboutSection: {
      eyebrow: "About me",
      title: "Engineering, operations and process improvement in one profile",
      paragraphs: [
        "I am Jorge Arce, a Systems Engineer who graduated from Universidad Autónoma de Centro América with the Summa Cum Laude Probatus distinction.",
        "Alongside software development, I have worked in emergency response since 2014, taking on responsibilities in coordination, instruction and workflow improvement in environments where clarity, compliance and decision-making matter.",
        "FireTrack summarizes how I work: I identified opportunities to improve an operational process, structured its rules and requirements, and turned them into a production SaaS solution.",
      ],
      facts: [
        "Costa Rica",
        "Native Spanish",
        "English C1",
        "Available for remote work",
      ],
      linkedinLabel: "View LinkedIn profile",
    },
    contactSection: {
      eyebrow: "Contact",
      title: "Do you have a project, an open role or a system that needs improvement?",
      description:
        "Tell me briefly what you need. We can identify a practical first stage, evaluate the scope and define a realistic solution.",
      primaryAction: "Send an email",
      secondaryAction: "Connect on LinkedIn",
    },
    footer: {
      description:
        "Systems Engineer and Full Stack Developer focused on process improvement, automation and digital solutions.",
      rights: "All rights reserved.",
    },
  },
} satisfies Record<Locale, SiteContent>;
