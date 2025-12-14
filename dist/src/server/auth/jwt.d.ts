export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
    iat: number;
    exp: number;
}
export declare function createToken(payload: Omit<JwtPayload, "iat" | "exp">, opts?: {
    secret?: string;
    expirySeconds?: number;
}): string;
export declare function verifyToken(token: string, secret?: string): JwtPayload | null;
export declare function extractBearerToken(authHeader?: string): string | null;
