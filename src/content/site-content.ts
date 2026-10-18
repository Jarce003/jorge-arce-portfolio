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
  slug: "firetrack" | "evacuaplan-studio" | "acreditaciones-app";
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
      title: "Jorge Arce | Ingeniero en Sistemas y soluciones digitales",
      description:
        "Diseño de soluciones digitales y mejora de procesos mediante desarrollo de productos asistido por IA.",
    },
    navigation: [
      { label: "Proyectos", href: "#proyectos" },
      { label: "Servicios", href: "#servicios" },
      { label: "Proceso", href: "#proceso" },
      { label: "Sobre mí", href: "#sobre-mi" },
    ],
    header: {
      role: "Ingeniero en Sistemas · Soluciones digitales",
      contact: "Contactarme",
    },
    hero: {
      availability:
        "Disponible para proyectos freelance, contratos y oportunidades remotas",
      title:
        "Identifico oportunidades de mejora y las convierto en soluciones digitales.",
      description:
        "Comprendo procesos reales, identifico lo que puede mejorar y defino productos para resolverlo. Dirijo las decisiones funcionales y valido los resultados, mientras la inteligencia artificial me asiste con la arquitectura y la programación.",
      primaryAction: "Explorar proyectos",
      secondaryAction: "Hablemos de su proyecto",
      technologiesLabel: "Tecnologías utilizadas en mis productos",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Supabase",
        "Python",
      ],
      metrics: [
        { value: "3", label: "productos destacados" },
        { value: "De idea a producto", label: "definición, pruebas y evolución" },
        { value: "C1", label: "nivel de inglés" },
      ],
    },
    projectsSection: {
      eyebrow: "Trabajo seleccionado",
      title: "De problemas operativos a productos digitales",
      description:
        "Proyectos que nacieron de problemas reales. Defino su funcionamiento, coordino la implementación asistida por IA y valido que resuelvan la necesidad original.",
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
        {
          slug: "acreditaciones-app",
          caseStudyLabel: "Ver caso de estudio",
          title: "Acreditaciones",
          status: "Sistema privado en evolución",
          description: "Sistema de control de acreditaciones de operadores con ciclos de vigencia, historial de pruebas, reportes y análisis para planificar evaluaciones.",
          highlights: [
            "Normalización de históricos, validación de identidad y reglas de vigencia por modalidad y bloques.",
            "Motor analítico independiente en Python con FastAPI, DuckDB y Google OR-Tools para análisis y planificación.",
            "Asistencia con IA, consultas a datos y trazabilidad de aprobaciones sin exponer información real en esta demostración.",
          ],
          technologies: ["Next.js", "TypeScript", "PostgreSQL", "Python", "FastAPI", "DuckDB", "OR-Tools", "IA"],
          gallery: [{
            id: "overview",
            label: "Vista conceptual",
            title: "Control de acreditaciones y planificación",
            description: "Visualización ilustrativa creada para el portafolio, sin datos de participantes reales.",
            src: "/projects/acreditaciones/overview.svg",
            alt: "Ilustración conceptual del sistema de acreditaciones sin datos reales",
          }],
        },
      ],
    },
    servicesSection: {
      "eyebrow": "Qué aporto",
      "title": "Del diagnóstico operativo al producto digital",
      "description": "Mi labor va de observar un proceso y descubrir oportunidades hasta definir un sistema y validar su funcionamiento. La implementación técnica se realiza con apoyo de IA.",
      "services": [
        {
          "number": "01",
          "title": "Análisis y mejora de procesos",
          "description": "Estudio las operaciones existentes, escucho necesidades, identifico ineficiencias y defino qué merece cambiar.",
          "details": "Diagnóstico · Requerimientos · Reglas de negocio · Mejora"
        },
        {
          "number": "02",
          "title": "Diseño funcional de soluciones digitales",
          "description": "Defino qué debe hacer el producto, cómo deben funcionar sus flujos y qué datos necesita; coordino su construcción con asistencia de IA.",
          "details": "Diseño de producto · UX · Automatización · IA aplicada"
        },
        {
          "number": "03",
          "title": "Pruebas y evolución del producto",
          "description": "Evalúo escenarios reales, detecto fallos, decido prioridades y verifico que cada versión atienda las necesidades del proceso.",
          "details": "Validación funcional · Iteración · Usabilidad · Control de calidad"
        }
      ]
    },
    processSection: {
      "eyebrow": "Mi método",
      "title": "De una oportunidad a una herramienta que funciona",
      "description": "No comienzo escribiendo código. Empiezo entendiendo la operación. Después convierto necesidades en requisitos, utilizo IA para explorar y construir alternativas, y pruebo el resultado.",
      "steps": [
        {
          "number": "01",
          "title": "Observar",
          "description": "Entiendo el proceso actual, sus responsables, reglas, limitaciones y objetivos."
        },
        {
          "number": "02",
          "title": "Identificar",
          "description": "Detecto fricciones, duplicaciones, riesgos y oportunidades de mejora."
        },
        {
          "number": "03",
          "title": "Diseñar y dirigir",
          "description": "Defino requisitos y experiencia; contrasto las alternativas técnicas propuestas con IA y coordino la implementación."
        },
        {
          "number": "04",
          "title": "Probar y evolucionar",
          "description": "Verifico los flujos con casos reales, informo de errores, refino prioridades y decido cuándo avanzar."
        }
      ]
    },
    valueSection: {
      "eyebrow": "Valor diferencial",
      "title": "El criterio operativo guía las decisiones tecnológicas",
      "items": [
        {
          "title": "Experiencia en operaciones",
          "description": "Comprendo cómo se ejecuta realmente el trabajo, no solo cómo debería verse un formulario."
        },
        {
          "title": "Pensamiento de sistemas",
          "description": "Relaciono personas, reglas, información y decisiones para convertir actividades dispersas en procesos coherentes."
        },
        {
          "title": "Creación de productos con IA",
          "description": "Convierto requisitos en soluciones funcionales coordinando la programación asistida por IA y validando sus resultados."
        },
        {
          "title": "Mejora permanente",
          "description": "Cuestiono lo innecesario, evalúo resultados y ajusto la solución a partir de la experiencia real del usuario."
        }
      ]
    },
    aiSection: {
      "eyebrow": "Cómo creo el software",
      "title": "Dirección humana, programación asistida por IA",
      "description": "Soy responsable de identificar el problema, definir requisitos, prioridades y reglas de negocio. ChatGPT y otras herramientas de IA proponen arquitecturas, generan código y colaboran en la implementación. Mi trabajo continúa con pruebas, revisión de comportamiento y decisiones sobre cada nueva versión. No atribuyo a mi autoría manual el código generado por IA.",
      "uses": [
        "Análisis de soluciones y arquitectura con IA",
        "Generación de código e integración asistidas por IA",
        "Pruebas, depuración y documentación guiadas",
        "Revisión funcional e iteración a partir de resultados"
      ],
      "guardrailsTitle": "Lo que dirijo y verifico",
      "guardrails": [
        "Defino los problemas y los criterios de aceptación.",
        "Reviso que los flujos respondan al proceso real.",
        "Solicito y compruebo controles de seguridad y acceso.",
        "Ejecuto pruebas y apruebo cada iteración antes de publicar."
      ]
    },
    aboutSection: {
      "eyebrow": "Sobre mí",
      "title": "Conectar el mundo operativo con las soluciones digitales",
      "paragraphs": [
        "Soy Jorge Arce, Ingeniero en Sistemas graduado de la Universidad Autónoma de Centro América con la distinción Summa Cum Laude Probatus.",
        "Mi experiencia en atención de emergencias desde 2014, incluyendo instrucción y coordinación, me ha permitido observar procedimientos reales y comprender el valor de la claridad, las reglas y la toma de decisiones.",
        "No escribo manualmente el código de las aplicaciones. Identifico oportunidades de mejora, estudio los procesos, defino los productos, coordino el desarrollo con IA y valido los resultados. FireTrack, EvacuaPlan y Acreditaciones demuestran este modo de trabajo."
      ],
      "facts": [
        "Costa Rica",
        "Español nativo",
        "Inglés C1",
        "Disponible para trabajo remoto"
      ],
      "linkedinLabel": "Ver perfil de LinkedIn"
    },
    contactSection: {
      eyebrow: "Contacto",
      title: "¿Tiene un proyecto, una vacante o un sistema que necesita mejorar?",
      description:
        "Cuénteme cómo funciona su proceso y qué necesita mejorar. Podemos descubrir oportunidades y definir una solución digital mediante desarrollo asistido por IA.",
      primaryAction: "Enviar un correo",
      secondaryAction: "Conectar en LinkedIn",
    },
    footer: {
      description:
        "Ingeniero en Sistemas enfocado en mejora de procesos, diseño de productos y creación de software asistida por IA.",
      rights: "Todos los derechos reservados.",
    },
  },
  en: {
    metadata: {
      title: "Jorge Arce | Systems Engineer & Digital Solutions",
      description:
        "Operational process improvement and digital product design through AI-assisted software development.",
    },
    navigation: [
      { label: "Projects", href: "#projects" },
      { label: "Services", href: "#services" },
      { label: "Process", href: "#process" },
      { label: "About", href: "#about" },
    ],
    header: {
      role: "Systems Engineer · Digital Solutions",
      contact: "Contact me",
    },
    hero: {
      availability:
        "Available for freelance projects, contracts and remote opportunities",
      title:
        "I turn opportunities for improvement into practical digital solutions.",
      description:
        "I study real workflows, identify improvements and define digital products to address them. I lead functional decisions and validate results while AI assists with architecture and coding.",
      primaryAction: "Explore projects",
      secondaryAction: "Let’s discuss your project",
      technologiesLabel: "Technologies used across my products",
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Supabase",
        "Python",
      ],
      metrics: [
        { value: "3", label: "featured products" },
        { value: "Idea to product", label: "definition, testing and evolution" },
        { value: "C1", label: "English proficiency" },
      ],
    },
    projectsSection: {
      eyebrow: "Selected work",
      title: "From operational problems to digital products",
      description:
        "Projects born from real operational problems. I define their behavior, coordinate AI-assisted implementation and validate that each result addresses the original need.",
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
        {
          slug: "acreditaciones-app",
          caseStudyLabel: "View case study",
          title: "Accreditations",
          status: "Private system in active development",
          description: "Operator accreditation management with validity cycles, test history, reporting and analytics for evaluation planning.",
          highlights: [
            "Historical record normalization, identity reconciliation and modality-specific validity rules.",
            "Independent Python analytics service with FastAPI, DuckDB and Google OR-Tools for analysis and scheduling.",
            "AI-assisted data questions and approval traceability, with no real participant information exposed in this demo.",
          ],
          technologies: ["Next.js", "TypeScript", "PostgreSQL", "Python", "FastAPI", "DuckDB", "OR-Tools", "AI"],
          gallery: [{
            id: "overview",
            label: "Concept preview",
            title: "Accreditation control and planning",
            description: "Illustrative portfolio preview created without real participant data.",
            src: "/projects/acreditaciones/overview.svg",
            alt: "Conceptual view of the accreditation system using synthetic data",
          }],
        },
      ],
    },
    servicesSection: {
      "eyebrow": "What I offer",
      "title": "From process diagnosis to digital products",
      "description": "My work starts by observing operations and identifying opportunities, then defining a system and validating how it works. AI supports technical implementation.",
      "services": [
        {
          "number": "01",
          "title": "Process analysis and improvement",
          "description": "I study existing operations, gather needs, identify inefficiencies and define what should change.",
          "details": "Discovery · Requirements · Business rules · Improvement"
        },
        {
          "number": "02",
          "title": "Functional digital product design",
          "description": "I define what products must do, how flows work and what data they need; then coordinate AI-assisted construction.",
          "details": "Product design · UX · Automation · Applied AI"
        },
        {
          "number": "03",
          "title": "Testing and product evolution",
          "description": "I evaluate real scenarios, identify defects, set priorities and verify each release against operational needs.",
          "details": "Functional validation · Iteration · Usability · Quality"
        }
      ]
    },
    processSection: {
      "eyebrow": "How I work",
      "title": "From an opportunity to a working tool",
      "description": "I do not start by writing code. I start by understanding operations. I translate needs into requirements, use AI to explore and build solutions, then validate the result.",
      "steps": [
        {
          "number": "01",
          "title": "Observe",
          "description": "I learn the existing process, responsibilities, rules, constraints and goals."
        },
        {
          "number": "02",
          "title": "Identify",
          "description": "I find friction, duplicated work, risks and opportunities for improvement."
        },
        {
          "number": "03",
          "title": "Design and guide",
          "description": "I define requirements and UX, evaluate AI-proposed technical alternatives and coordinate implementation."
        },
        {
          "number": "04",
          "title": "Test and evolve",
          "description": "I validate workflows, report issues, refine priorities and decide when to move forward."
        }
      ]
    },
    valueSection: {
      "eyebrow": "What makes my work different",
      "title": "Operational understanding guides technical decisions",
      "items": [
        {
          "title": "Firsthand operational perspective",
          "description": "I understand how work gets done, not only how a form should look."
        },
        {
          "title": "Systems thinking",
          "description": "I connect people, rules, information and decisions into coherent workflows."
        },
        {
          "title": "Product creation with AI",
          "description": "I turn requirements into functional products by coordinating AI-assisted programming and validating results."
        },
        {
          "title": "Continuous improvement",
          "description": "I question unnecessary steps and refine solutions based on the user's real experience."
        }
      ]
    },
    aiSection: {
      "eyebrow": "How I create software",
      "title": "Human-led product decisions, AI-assisted coding",
      "description": "I identify problems and define requirements, priorities and business rules. ChatGPT and other AI tools propose architectures, generate code and help implement software. I then test its behavior and guide each iteration. I do not claim to have manually written code generated by AI.",
      "uses": [
        "Solution discovery and architecture with AI",
        "AI-assisted code generation and integration",
        "Guided testing, debugging and documentation",
        "Functional review and iterative improvement"
      ],
      "guardrailsTitle": "What I lead and validate",
      "guardrails": [
        "I define problems and acceptance criteria.",
        "I verify that workflows match real operations.",
        "I request and check security and access controls.",
        "I run tests and approve releases before publication."
      ]
    },
    aboutSection: {
      "eyebrow": "About me",
      "title": "Connecting real-world operations with digital solutions",
      "paragraphs": [
        "I am Jorge Arce, a Systems Engineer who graduated from Universidad Autónoma de Centro América with the Summa Cum Laude Probatus distinction.",
        "My emergency response experience since 2014, including instruction and coordination, has taught me how to observe real workflows and understand the importance of clear rules and decisions.",
        "I do not manually write the application code. I identify improvement opportunities, study processes, define the product, coordinate AI-assisted development and validate the results. FireTrack, EvacuaPlan and Accreditations illustrate this approach."
      ],
      "facts": [
        "Costa Rica",
        "Native Spanish",
        "English C1",
        "Available for remote work"
      ],
      "linkedinLabel": "View LinkedIn profile"
    },
    contactSection: {
      eyebrow: "Contact",
      title: "Do you have a project, an open role or a system that needs improvement?",
      description:
        "Tell me about the process you want to improve. We can explore opportunities and define an AI-assisted digital solution.",
      primaryAction: "Send an email",
      secondaryAction: "Connect on LinkedIn",
    },
    footer: {
      description:
        "Systems Engineer focused on process improvement, digital product design and AI-assisted software creation.",
      rights: "All rights reserved.",
    },
  },
} satisfies Record<Locale, SiteContent>;
