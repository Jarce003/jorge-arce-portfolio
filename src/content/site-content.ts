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
        "Construyo aplicaciones web que convierten procesos complejos en soluciones claras y confiables.",
      description:
        "Soy Ingeniero en Sistemas y desarrollador Full Stack. Diseño productos digitales desde el análisis de la necesidad hasta la arquitectura, implementación, validación y despliegue.",
      primaryAction: "Ver proyectos",
      secondaryAction: "Hablemos de su proyecto",
      technologiesLabel: "Stack principal",
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
      title: "Productos construidos para operaciones reales",
      description:
        "Proyectos en los que he participado de extremo a extremo: definición funcional, arquitectura, desarrollo, pruebas, seguridad y despliegue.",
      projects: [
        {
          title: "FireTrack",
          status: "En producción",
          description:
            "Plataforma SaaS multiempresa para gestionar inventario, inspecciones, mantenimiento y trazabilidad de extintores.",
          highlights: [
            "Arquitectura multiempresa con autenticación, roles y aislamiento seguro de datos.",
            "Códigos QR, reportes PDF, alertas, auditoría e importación desde Excel.",
            "Aplicación desplegada y mantenida mediante entregas incrementales.",
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
          title: "EvacuaPlan Studio",
          status: "En desarrollo activo",
          description:
            "Editor web interactivo para crear croquis profesionales de emergencia y evacuación desde computadoras y dispositivos táctiles.",
          highlights: [
            "Herramientas para paredes, puertas, ventanas, áreas, textos y símbolos.",
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
      title: "Cómo puedo aportar a un proyecto",
      description:
        "Trabajo principalmente en productos web, sistemas empresariales y aplicaciones que requieren flujos, datos y reglas de negocio bien definidos.",
      services: [
        {
          number: "01",
          title: "Desarrollo de productos web",
          description:
            "Aplicaciones empresariales, plataformas SaaS, dashboards y herramientas internas.",
          details:
            "Next.js · React · TypeScript · Node.js · PostgreSQL",
        },
        {
          number: "02",
          title: "Mejoras e integraciones",
          description:
            "Nuevas funcionalidades, APIs, autenticación, roles, reportes y corrección de problemas.",
          details: "REST APIs · Supabase · SQL · PDF · Correo · QR",
        },
        {
          number: "03",
          title: "QA y validación funcional",
          description:
            "Pruebas de flujos, reproducción de errores y validación responsive y de regresión.",
          details: "Web · Móvil · iPad · Roles · Permisos · UX",
        },
      ],
    },
    processSection: {
      eyebrow: "Forma de trabajo",
      title: "De una necesidad operativa a una solución funcional",
      description:
        "Un proceso claro permite reducir incertidumbre, controlar el alcance y validar cada avance antes de continuar.",
      steps: [
        {
          number: "01",
          title: "Comprender",
          description:
            "Analizo el problema, los usuarios, las reglas de negocio y el resultado esperado.",
        },
        {
          number: "02",
          title: "Planificar",
          description:
            "Defino alcance, flujos, estructura de datos, riesgos y una implementación por etapas.",
        },
        {
          number: "03",
          title: "Construir",
          description:
            "Desarrollo funcionalidades mantenibles mediante cambios controlados y checkpoints.",
        },
        {
          number: "04",
          title: "Verificar",
          description:
            "Pruebo los flujos, valido la seguridad y reviso el comportamiento antes del despliegue.",
        },
      ],
    },
    valueSection: {
      eyebrow: "Valor profesional",
      title: "Más que escribir código",
      items: [
        {
          title: "Visión integral",
          description:
            "Puedo trabajar en requerimientos, interfaz, backend, base de datos, seguridad, pruebas y despliegue.",
        },
        {
          title: "Comprensión operativa",
          description:
            "Mi trayectoria técnica me ayuda a comprender procesos reales, riesgos y necesidades de usuarios no técnicos.",
        },
        {
          title: "Mentalidad de calidad",
          description:
            "Valido los cambios mediante pruebas funcionales, builds, revisión visual y verificación posterior al despliegue.",
        },
        {
          title: "Comunicación clara",
          description:
            "Traduzco necesidades empresariales en decisiones técnicas comprensibles y trazables.",
        },
      ],
    },
    aboutSection: {
      eyebrow: "Sobre mí",
      title: "Ingeniería, operaciones y resolución de problemas",
      paragraphs: [
        "Soy Jorge Arce, Ingeniero en Sistemas graduado de la Universidad Autónoma de Centro América con la distinción Summa Cum Laude Probatus.",
        "Además del desarrollo de software, trabajo en atención de emergencias desde 2014 y tengo experiencia como instructor y coordinador de proyectos de capacitación.",
        "Esta combinación fortaleció mi disciplina, liderazgo, comunicación y capacidad para analizar necesidades reales y convertirlas en soluciones confiables.",
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
        "Full Stack Software Engineer enfocado en aplicaciones SaaS y soluciones empresariales.",
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
        "I build web applications that turn complex processes into clear and reliable solutions.",
      description:
        "I am a Systems Engineer and Full Stack Developer. I design digital products from requirements analysis through architecture, implementation, validation and deployment.",
      primaryAction: "View projects",
      secondaryAction: "Let’s discuss your project",
      technologiesLabel: "Core stack",
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
      title: "Products built for real operations",
      description:
        "Projects where I have contributed across the full lifecycle: functional definition, architecture, development, testing, security and deployment.",
      projects: [
        {
          title: "FireTrack",
          status: "In production",
          description:
            "Multi-tenant SaaS platform for fire extinguisher inventory, inspections, maintenance and operational traceability.",
          highlights: [
            "Multi-company architecture with authentication, roles and secure data isolation.",
            "QR workflows, PDF reporting, alerts, audit records and Excel imports.",
            "Deployed application maintained through controlled incremental releases.",
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
          title: "EvacuaPlan Studio",
          status: "Active development",
          description:
            "Interactive web editor for creating professional emergency and evacuation plans on desktop and touch devices.",
          highlights: [
            "Tools for walls, doors, windows, areas, text and emergency symbols.",
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
      title: "How I can contribute",
      description:
        "I focus on web products, business systems and applications that depend on well-defined workflows, data and business rules.",
      services: [
        {
          number: "01",
          title: "Web product development",
          description:
            "Business applications, SaaS platforms, dashboards and internal tools.",
          details:
            "Next.js · React · TypeScript · Node.js · PostgreSQL",
        },
        {
          number: "02",
          title: "Improvements and integrations",
          description:
            "New features, APIs, authentication, roles, reports and application troubleshooting.",
          details: "REST APIs · Supabase · SQL · PDF · Email · QR",
        },
        {
          number: "03",
          title: "Functional QA and validation",
          description:
            "User-flow testing, defect reproduction, responsive validation and regression testing.",
          details: "Web · Mobile · iPad · Roles · Permissions · UX",
        },
      ],
    },
    processSection: {
      eyebrow: "Working process",
      title: "From an operational need to a functional solution",
      description:
        "A clear process reduces uncertainty, controls scope and validates each stage before moving forward.",
      steps: [
        {
          number: "01",
          title: "Understand",
          description:
            "I analyze the problem, users, business rules and expected outcome.",
        },
        {
          number: "02",
          title: "Plan",
          description:
            "I define scope, workflows, data structure, risks and an incremental implementation.",
        },
        {
          number: "03",
          title: "Build",
          description:
            "I develop maintainable features through controlled changes and checkpoints.",
        },
        {
          number: "04",
          title: "Verify",
          description:
            "I test workflows, validate security and review behavior before deployment.",
        },
      ],
    },
    valueSection: {
      eyebrow: "Professional value",
      title: "More than writing code",
      items: [
        {
          title: "End-to-end perspective",
          description:
            "I can contribute to requirements, frontend, backend, databases, security, testing and deployment.",
        },
        {
          title: "Operational understanding",
          description:
            "My technical background helps me understand real processes, risks and the needs of non-technical users.",
        },
        {
          title: "Quality mindset",
          description:
            "I validate changes through functional testing, builds, visual review and post-deployment verification.",
        },
        {
          title: "Clear communication",
          description:
            "I translate business requirements into understandable and traceable technical decisions.",
        },
      ],
    },
    aboutSection: {
      eyebrow: "About me",
      title: "Engineering, operations and problem solving",
      paragraphs: [
        "I am Jorge Arce, a Systems Engineer who graduated from Universidad Autónoma de Centro América with the Summa Cum Laude Probatus distinction.",
        "Alongside software development, I have worked in emergency response since 2014 and have experience as a technical instructor and training-project coordinator.",
        "This combination strengthened my discipline, leadership, communication and ability to convert real operational needs into reliable solutions.",
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
        "Full Stack Software Engineer focused on SaaS applications and business solutions.",
      rights: "All rights reserved.",
    },
  },
} satisfies Record<Locale, SiteContent>;
