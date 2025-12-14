import crypto from "node:crypto";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  iat: number;
  exp: number;
}

const DEFAULT_SECRET = "num-agents-dev-secret-change-in-prod";
const DEFAULT_EXPIRY_SECONDS = 86400; // 24h

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
  opts?: { secret?: string; expirySeconds?: number }
): string {
  const secret = opts?.secret ?? DEFAULT_SECRET;
  const expirySeconds = opts?.expirySeconds ?? DEFAULT_EXPIRY_SECONDS;

  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expirySeconds,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = sign(`${headerB64}.${payloadB64}`, secret);

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyToken(token: string, secret?: string): JwtPayload | null {
  const s = secret ?? DEFAULT_SECRET;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expectedSig = sign(`${headerB64}.${payloadB64}`, s);

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64!)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
