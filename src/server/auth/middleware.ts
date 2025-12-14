import type { IncomingMessage, ServerResponse } from "node:http";
import { getRequiredPermission, hasPermission, type User } from "../../core/auth.schema.js";
import { extractBearerToken, verifyToken } from "./jwt.js";
import { UserStore } from "./store.js";

export class AuthError extends Error {
  constructor(
    public code: "UNAUTHORIZED" | "FORBIDDEN" | "TOKEN_EXPIRED" | "INVALID_TOKEN",
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AuthContext {
  user: User;
  tenantId: string;
}

export async function authenticate(
  req: IncomingMessage,
  userStore: UserStore,
  jwtSecret?: string
): Promise<AuthContext> {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    throw new AuthError("UNAUTHORIZED", "Missing authorization header");
  }

  const payload = verifyToken(token, jwtSecret);
  if (!payload) {
    throw new AuthError("INVALID_TOKEN", "Invalid or expired token");
  }

  const user = await userStore.getUser(payload.sub);
  if (!user) {
    throw new AuthError("UNAUTHORIZED", "User not found");
  }

  if (!user.enabled) {
    throw new AuthError("FORBIDDEN", "User account is disabled");
  }

  return {
    user,
    tenantId: user.tenantId,
  };
}

export function authorize(user: User, toolName: string): void {
  const requiredPerm = getRequiredPermission(toolName);

  if (requiredPerm && !hasPermission(user, requiredPerm)) {
    throw new AuthError(
      "FORBIDDEN",
      `User ${user.email} lacks permission '${requiredPerm}' for tool '${toolName}'`
    );
  }
}

export function sendAuthError(res: ServerResponse, error: AuthError): void {
  const status = error.code === "UNAUTHORIZED" ? 401 : 403;
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: error.code, message: error.message }));
}
