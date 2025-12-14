export type Role = "admin" | "developer" | "viewer";
export type Permission = "modes.read" | "modes.write" | "packs.read" | "packs.import" | "packs.export" | "orchestrate.run" | "pipeline.apply" | "git.write" | "policy.admin";
export declare const rolePermissions: Record<Role, Permission[]>;
export declare function hasPermission(user: {
    roles?: Role[];
}, perm: Permission): boolean;
export declare const toolToPermission: Array<{
    match: RegExp;
    perm: Permission;
}>;
export declare function requiredPermissionForTool(tool: string): Permission | null;
