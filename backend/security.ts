import crypto from "crypto";

type Bucket = {
  count: number;
  resetAt: number;
};

type TokenRecord = {
  codeHash: string;
  expiresAt: number;
  identifier: string;
  purpose: "email" | "otp" | "password-reset";
};

const globalSecurity = globalThis as typeof globalThis & {
  __checkinfoRateBuckets?: Map<string, Bucket>;
  __checkinfoSecurityTokens?: Map<string, TokenRecord>;
};

function buckets() {
  globalSecurity.__checkinfoRateBuckets ??= new Map();
  return globalSecurity.__checkinfoRateBuckets;
}

function tokens() {
  globalSecurity.__checkinfoSecurityTokens ??= new Map();
  return globalSecurity.__checkinfoSecurityTokens;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export function rateLimit(request: Request, scope: string, limit = 60, windowMs = 60_000) {
  const key = `${scope}:${clientIp(request)}`;
  const now = Date.now();
  const existing = buckets().get(key);
  if (!existing || existing.resetAt <= now) {
    buckets().set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  existing.count += 1;
  return { ok: existing.count <= limit, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

export function rateLimitResponse(result: ReturnType<typeof rateLimit>) {
  return Response.json(
    { message: "Too many requests. Please try again shortly.", ok: false },
    {
      headers: {
        "retry-after": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
        "x-ratelimit-remaining": String(result.remaining),
      },
      status: 429,
    },
  );
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);
  return originUrl.host === requestUrl.host;
}

export function assertCsrf(request: Request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return true;
  if (!assertSameOrigin(request)) return false;
  const headerToken = request.headers.get("x-csrf-token");
  if (!headerToken) return true;
  const cookie = request.headers.get("cookie") || "";
  const cookieToken = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("checkinfo_csrf="))?.split("=")[1];
  if (!cookieToken || headerToken.length !== cookieToken.length) return false;
  return crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken));
}

export function csrfResponse() {
  return Response.json({ message: "Security check failed. Refresh and try again.", ok: false }, { status: 403 });
}

export function cleanText(value: unknown, maxLength = 500) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength);
}

export function isEmail(value: unknown) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

export function isPhone(value: unknown) {
  return /^[6-9]\d{9}$/.test(String(value ?? "").replace(/\D/g, "").slice(-10));
}

export function validateImageFile(file: File, maxBytes = 2 * 1024 * 1024) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return "Only JPG, PNG, WEBP, or GIF images are allowed.";
  if (file.size > maxBytes) return "Image must be 2MB or smaller.";
  return "";
}

export function issueSecurityToken(identifier: string, purpose: TokenRecord["purpose"], ttlMs = 15 * 60_000) {
  const code = purpose === "otp" ? String(Math.floor(100000 + Math.random() * 900000)) : crypto.randomBytes(18).toString("base64url");
  const id = crypto.randomBytes(12).toString("base64url");
  tokens().set(id, {
    codeHash: crypto.createHash("sha256").update(code).digest("hex"),
    expiresAt: Date.now() + ttlMs,
    identifier,
    purpose,
  });
  return { code, expiresAt: Date.now() + ttlMs, id };
}

export function verifySecurityToken(id: string, code: string, purpose: TokenRecord["purpose"]) {
  const record = tokens().get(id);
  if (!record || record.purpose !== purpose || record.expiresAt <= Date.now()) return null;
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  if (codeHash !== record.codeHash) return null;
  tokens().delete(id);
  return record.identifier;
}

export function envConfigured(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function redactedEnvStatus(names: string[]) {
  return Object.fromEntries(names.map((name) => [name, envConfigured(name) ? "configured" : "missing"]));
}
