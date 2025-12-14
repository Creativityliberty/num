import type { IncomingMessage, ServerResponse } from "node:http";
import { type User } from "../../core/auth.schema.js";
import { UserStore } from "./store.js";
export declare class AuthError extends Error {
    code: "UNAUTHORIZED" | "FORBIDDEN" | "TOKEN_EXPIRED" | "INVALID_TOKEN";
    constructor(code: "UNAUTHORIZED" | "FORBIDDEN" | "TOKEN_EXPIRED" | "INVALID_TOKEN", message: string);
}
export interface AuthContext {
    user: User;
    tenantId: string;
}
export declare function authenticate(req: IncomingMessage, userStore: UserStore, jwtSecret?: string): Promise<AuthContext>;
export declare function authorize(user: User, toolName: string): void;
export declare function sendAuthError(res: ServerResponse, error: AuthError): void;
