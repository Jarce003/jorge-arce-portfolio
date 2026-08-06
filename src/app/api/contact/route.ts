import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const MAX_BODY_BYTES = 16_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type TurnstileVerification = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

type ContactLanguage = "es" | "en";

const globalRateLimit = globalThis as typeof globalThis & {
  portfolioContactRateLimit?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalRateLimit.portfolioContactRateLimit ??
  new Map<string, RateLimitEntry>();

globalRateLimit.portfolioContactRateLimit = rateLimitStore;

const responseMessages = {
  es: {
    invalid:
      "Revisa el correo y escribe un mensaje de al menos 10 caracteres.",
    verification:
      "No pudimos completar la verificación de seguridad. Inténtalo nuevamente.",
    rateLimit:
      "Has enviado varios mensajes. Espera unos minutos antes de intentarlo nuevamente.",
    unavailable:
      "El formulario no está disponible temporalmente. Inténtalo más tarde.",
    sendError:
      "No fue posible enviar el mensaje. Inténtalo nuevamente más tarde.",
    success:
      "Mensaje enviado correctamente. Te responderé lo antes posible.",
  },
  en: {
    invalid:
      "Check the email address and enter a message of at least 10 characters.",
    verification:
      "The security verification could not be completed. Please try again.",
    rateLimit:
      "Several messages have been submitted. Please wait a few minutes before trying again.",
    unavailable:
      "The form is temporarily unavailable. Please try again later.",
    sendError:
      "The message could not be sent. Please try again later.",
    success:
      "Your message was sent successfully. I will reply as soon as possible.",
  },
} satisfies Record<
  ContactLanguage,
  {
    invalid: string;
    verification: string;
    rateLimit: string;
    unavailable: string;
    sendError: string;
    success: string;
  }
>;

function jsonResponse(
  body: {
    ok: boolean;
    message: string;
  },
  status: number,
  additionalHeaders: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...additionalHeaders,
    },
  });
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function consumeRateLimit(clientIp: string) {
  const now = Date.now();

  if (rateLimitStore.size > 500) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  const current = rateLimitStore.get(clientIp);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      ),
    };
  }

  current.count += 1;
  rateLimitStore.set(clientIp, current);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return (
    email.length > 3 &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAllowedHostnames() {
  return (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
}

async function verifyTurnstileToken(
  token: string,
  clientIp: string,
  secretKey: string,
): Promise<TurnstileVerification> {
  const body = new FormData();
  body.set("secret", secretKey);
  body.set("response", token);

  if (clientIp !== "unknown") {
    body.set("remoteip", clientIp);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        signal: controller.signal,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        "error-codes": ["siteverify-http-error"],
      };
    }

    return (await response.json()) as TurnstileVerification;
  } catch {
    return {
      success: false,
      "error-codes": ["siteverify-network-error"],
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(
      {
        ok: false,
        message: responseMessages.es.invalid,
      },
      413,
    );
  }

  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        message: responseMessages.es.invalid,
      },
      400,
    );
  }

  if (
    !parsedBody ||
    typeof parsedBody !== "object" ||
    Array.isArray(parsedBody)
  ) {
    return jsonResponse(
      {
        ok: false,
        message: responseMessages.es.invalid,
      },
      400,
    );
  }

  const body = parsedBody as Record<string, unknown>;
  const lang: ContactLanguage = body.lang === "en" ? "en" : "es";
  const messages = responseMessages[lang];

  const email = readString(body.email);
  const message = readString(body.message);
  const website = readString(body.website);
  const turnstileToken = readString(body.turnstileToken);
  const sourcePath = readString(body.sourcePath);

  /*
   * Los visitantes reales nunca ven este campo.
   * Los bots que lo completan reciben una respuesta genérica,
   * pero no generan ningún correo.
   */
  if (website) {
    return jsonResponse(
      {
        ok: true,
        message: messages.success,
      },
      200,
    );
  }

  if (
    !isValidEmail(email) ||
    message.length < 10 ||
    message.length > 3000 ||
    turnstileToken.length < 1 ||
    turnstileToken.length > 2048 ||
    (sourcePath &&
      (sourcePath.length > 200 ||
        !sourcePath.startsWith("/") ||
        /\s/.test(sourcePath)))
  ) {
    return jsonResponse(
      {
        ok: false,
        message: messages.invalid,
      },
      400,
    );
  }

  const clientIp = getClientIp(request);

  /*
   * El límite se aplica en producción. En desarrollo se omite para
   * permitir pruebas repetidas sin esperar quince minutos.
   */
  if (process.env.NODE_ENV !== "development") {
    const rateLimit = consumeRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return jsonResponse(
        {
          ok: false,
          message: messages.rateLimit,
        },
        429,
        {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      );
    }
  }

  const turnstileSecret =
    process.env.TURNSTILE_SECRET_KEY ??
    (process.env.NODE_ENV === "development"
      ? "1x0000000000000000000000000000000AA"
      : "");

  if (!turnstileSecret) {
    console.error("TURNSTILE_SECRET_KEY is not configured.");

    return jsonResponse(
      {
        ok: false,
        message: messages.unavailable,
      },
      503,
    );
  }

  const verification = await verifyTurnstileToken(
    turnstileToken,
    clientIp,
    turnstileSecret,
  );

  /*
   * Las claves ficticias oficiales se aceptan únicamente durante
   * desarrollo. Producción conserva la validación estricta de
   * hostname y action.
   */
  const isOfficialTestEnvironment =
    turnstileSecret === "1x0000000000000000000000000000000AA" &&
    (process.env.NODE_ENV === "development" ||
      process.env.CONTACT_FORM_TEST_MODE === "true");

  const allowedHostnames = getAllowedHostnames();
  const normalizedHostname = verification.hostname?.toLowerCase();

  const hostnameIsValid =
    isOfficialTestEnvironment ||
    allowedHostnames.length === 0 ||
    (Boolean(normalizedHostname) &&
      allowedHostnames.includes(normalizedHostname as string));

  const actionIsValid =
    isOfficialTestEnvironment ||
    verification.action === "portfolio_contact";

  if (
    !verification.success ||
    !actionIsValid ||
    !hostnameIsValid
  ) {
    console.warn("Turnstile verification rejected.", {
      action: verification.action,
      hostname: verification.hostname,
      errorCodes: verification["error-codes"],
    });

    return jsonResponse(
      {
        ok: false,
        message: messages.verification,
      },
      400,
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  const sender = process.env.CONTACT_FROM_EMAIL;

  if (!resendApiKey || !recipient || !sender) {
    console.error("Contact email environment variables are not configured.");

    return jsonResponse(
      {
        ok: false,
        message: messages.unavailable,
      },
      503,
    );
  }

  const resend = new Resend(resendApiKey);
  const submittedAt = new Date().toISOString();
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeSourcePath = escapeHtml(sourcePath || "No disponible");

  const subject =
    lang === "es"
      ? "[jarcedev.com] Nuevo contacto"
      : "[jarcedev.com] New contact";

  const text = [
    subject,
    "",
    `Correo: ${email}`,
    `Idioma: ${lang}`,
    `Página: ${sourcePath || "No disponible"}`,
    `Fecha: ${submittedAt}`,
    "",
    "Mensaje:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #0f172a;">
      <h1 style="font-size: 22px; margin-bottom: 24px;">
        ${subject}
      </h1>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Correo</td>
          <td style="padding: 8px 0;">${safeEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Idioma</td>
          <td style="padding: 8px 0;">${lang}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Página</td>
          <td style="padding: 8px 0;">${safeSourcePath}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Fecha</td>
          <td style="padding: 8px 0;">${submittedAt}</td>
        </tr>
      </table>

      <div style="padding: 20px; background: #f1f5f9; border-radius: 12px; line-height: 1.7;">
        ${safeMessage}
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: sender,
    to: recipient,
    replyTo: email,
    subject,
    text,
    html,
    tags: [
      {
        name: "source",
        value: "portfolio",
      },
      {
        name: "language",
        value: lang,
      },
    ],
  });

  if (error) {
    console.error("Resend contact email failed.", {
      name: error.name,
      message: error.message,
    });

    return jsonResponse(
      {
        ok: false,
        message: messages.sendError,
      },
      502,
    );
  }

  return jsonResponse(
    {
      ok: true,
      message: messages.success,
    },
    200,
  );
}