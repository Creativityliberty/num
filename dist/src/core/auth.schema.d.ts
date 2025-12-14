import { z } from "zod";
export declare const RoleSchema: z.ZodEnum<["admin", "developer", "viewer"]>;
export declare const PermissionSchema: z.ZodEnum<["modes.read", "modes.write", "packs.import", "packs.export", "orchestrate.run", "pipeline.apply", "policy.override", "tenant.manage", "users.manage"]>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    passwordHash: z.ZodString;
    role: z.ZodEnum<["admin", "developer", "viewer"]>;
    tenantId: z.ZodString;
    enabled: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role?: "developer" | "admin" | "viewer";
    id?: string;
    createdAt?: string;
    enabled?: boolean;
    email?: string;
    passwordHash?: string;
    tenantId?: string;
}, {
    role?: "developer" | "admin" | "viewer";
    id?: string;
    createdAt?: string;
    enabled?: boolean;
    email?: string;
    passwordHash?: string;
    tenantId?: string;
}>;
export type Role = z.infer<typeof RoleSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type User = z.infer<typeof UserSchema>;
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export declare function hasPermission(user: User, permission: Permission): boolean;
export declare const TOOL_PERMISSIONS: Record<string, Permission>;
export declare function getRequiredPermission(toolName: string): Permission | null;
