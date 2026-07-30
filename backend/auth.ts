import { createHmac, timingSafeEqual } from "node:crypto";

export type AuthRole = "admin" | "member";

const cookieNames: Record<AuthRole, string> = {
  admin: "checkinfo_admin_auth",
  member: "checkinfo_member_auth",
};

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getAuthSecret() {
  return process.env.AUTH_SECRET || "checkinfo-local-dev-secret-change-in-production";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

export function getAuthCookieName(role: AuthRole) {
  return cookieNames[role];
}

export function createSessionToken(role: AuthRole, username: string) {
  const payload = base64Url(JSON.stringify({
    exp: Date.now() + 1000 * 60 * 60 * 12,
    role,
    username,
  }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, role: AuthRole) {
  if (!token || !token.includes(".")) return false;

  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);

  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return false;

  try {
    const data = JSON.parse(fromBase64Url(payload)) as { exp?: number; role?: string };
    return data.role === role && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function getExpectedCredentials(role: AuthRole) {
  if (role === "admin") {
    return {
      password: process.env.ADMIN_LOGIN_PASSWORD || "admin123",
      username: process.env.ADMIN_LOGIN_USERNAME || "admin",
    };
  }

  return {
    password: process.env.MEMBER_LOGIN_PASSWORD || "member123",
    username: process.env.MEMBER_LOGIN_USERNAME || "member",
  };
}

export function validCredentials(role: AuthRole, username: string, password: string) {
  const expected = getExpectedCredentials(role);
  return username.trim() === expected.username && password === expected.password;
}
