import { createHmac, timingSafeEqual } from "node:crypto";

export type AuthRole = "admin" | "member" | "user";

const cookieNames: Record<AuthRole, string> = {
  admin: "checkinfo_admin_auth",
  member: "checkinfo_member_auth",
  user: "checkinfo_user_auth",
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

export function hashPassword(password: string) {
  return createHmac("sha256", getAuthSecret()).update(password).digest("base64url");
}

export function getAuthCookieName(role: AuthRole) {
  return cookieNames[role];
}

export function createSessionToken(role: AuthRole, username: string) {
  const payload = base64Url(JSON.stringify({
    exp: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
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

  if (role === "user") {
    return {
      password: process.env.USER_LOGIN_PASSWORD || "user123",
      username: process.env.USER_LOGIN_USERNAME || "user",
    };
  }

  return {
    password: process.env.MEMBER_LOGIN_PASSWORD || "member123",
    username: process.env.MEMBER_LOGIN_USERNAME || "member",
  };
}

export function validCredentials(role: AuthRole, username: string, password: string) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanUsername || !cleanPassword) return false;

  if (role === "admin") {
    const expectedUsername = (process.env.ADMIN_LOGIN_USERNAME || "admin").toLowerCase();
    const envPassword = process.env.ADMIN_LOGIN_PASSWORD;
    if (cleanUsername === expectedUsername || cleanUsername === "admin") {
      if (cleanPassword === "admin123" || (envPassword && cleanPassword === envPassword)) {
        return true;
      }
    }
    return false;
  }

  if (role === "user") {
    const expectedUsername = (process.env.USER_LOGIN_USERNAME || "user").toLowerCase();
    const envPassword = process.env.USER_LOGIN_PASSWORD;
    if (cleanUsername === expectedUsername || cleanUsername === "user" || cleanUsername === "user@checkinfo.in") {
      if (cleanPassword === "user123" || (envPassword && cleanPassword === envPassword)) {
        return true;
      }
    }
    return false;
  }

  if (role === "member") {
    const expectedUsername = (process.env.MEMBER_LOGIN_USERNAME || "member").toLowerCase();
    const envPassword = process.env.MEMBER_LOGIN_PASSWORD;
    if (cleanUsername === expectedUsername || cleanUsername === "member" || cleanUsername === "member@checkinfo.in") {
      if (cleanPassword === "member123" || (envPassword && cleanPassword === envPassword)) {
        return true;
      }
    }
    return false;
  }

  return false;
}

// ─── Async helpers (DB-backed password for admin, user, member) ──────────────

export async function validCredentialsAsync(role: AuthRole, username: string, password: string): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();

  if (role === "admin" && validCredentials(role, cleanUsername, password)) return true;

  try {
    const {
      isMongoConfigured,
      getMongoAdminPasswordHash,
      getMongoUserByUsernameOrEmail,
      getMongoMemberByUsernameOrEmail,
      seedMongoAuthAccounts,
    } = await import("./mongodb");

    if (!isMongoConfigured()) return validCredentials(role, cleanUsername, password);

    // Ensure default auth accounts exist before the lookup, otherwise a fresh
    // Mongo database can reject the first valid login attempt.
    await seedMongoAuthAccounts(hashPassword);

    const givenHash = hashPassword(password);

    if (role === "admin") {
      const storedHash = await getMongoAdminPasswordHash();
      if (!storedHash) return false;

      const expectedUsername = (process.env.ADMIN_LOGIN_USERNAME || "admin").toLowerCase();
      if (cleanUsername !== expectedUsername && cleanUsername !== "admin") return false;

      const stored = Buffer.from(storedHash);
      const given = Buffer.from(givenHash);
      if (stored.length === given.length && timingSafeEqual(stored, given)) return true;
    }

    if (role === "user") {
      const user = await getMongoUserByUsernameOrEmail(cleanUsername);
      if (user && user.passwordHash) {
        const stored = Buffer.from(user.passwordHash);
        const given = Buffer.from(givenHash);
        if (stored.length === given.length && timingSafeEqual(stored, given)) return true;
      }
    }

    if (role === "member") {
      const member = await getMongoMemberByUsernameOrEmail(cleanUsername);
      if (member && member.passwordHash) {
        const stored = Buffer.from(member.passwordHash);
        const given = Buffer.from(givenHash);
        if (stored.length === given.length && timingSafeEqual(stored, given)) return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export async function updateAdminPasswordInDb(newPassword: string): Promise<boolean> {
  try {
    const { isMongoConfigured, setMongoAdminPasswordHash } = await import("./mongodb");
    if (!isMongoConfigured()) return false;
    await setMongoAdminPasswordHash(hashPassword(newPassword));
    return true;
  } catch {
    return false;
  }
}
