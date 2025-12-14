import { getRequiredPermission, hasPermission } from "../../core/auth.schema.js";
import { extractBearerToken, verifyToken } from "./jwt.js";
export class AuthError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "AuthError";
    }
}
export async function authenticate(req, userStore, jwtSecret) {
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
export function authorize(user, toolName) {
    const requiredPerm = getRequiredPermission(toolName);
    if (requiredPerm && !hasPermission(user, requiredPerm)) {
        throw new AuthError("FORBIDDEN", `User ${user.email} lacks permission '${requiredPerm}' for tool '${toolName}'`);
    }
}
export function sendAuthError(res, error) {
    const status = error.code === "UNAUTHORIZED" ? 401 : 403;
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: error.code, message: error.message }));
}
