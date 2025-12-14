export type AuditLogEntry = {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    resource: string;
    status: "success" | "failure";
    details?: Record<string, unknown>;
};
export type RBACRole = {
    name: string;
    permissions: string[];
    description?: string;
};
export type RBACUser = {
    id: string;
    username: string;
    role: string;
    createdAt: string;
};
export declare class AuditLogger {
    private root;
    constructor(root: string);
    log(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry;
    getLogs(days?: number): AuditLogEntry[];
}
export declare class RBACManager {
    private root;
    private roles;
    private users;
    constructor(root: string);
    private initializeDefaultRoles;
    addUser(user: RBACUser): void;
    hasPermission(userId: string, permission: string): boolean;
    getUser(userId: string): RBACUser | null;
    saveUsers(): void;
    loadUsers(): void;
}
export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, hash: string): boolean;
export declare function generateToken(): string;
