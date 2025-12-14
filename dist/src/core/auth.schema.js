import { z } from "zod";
export const RoleSchema = z.enum(["admin", "developer", "viewer"]);
export const PermissionSchema = z.enum([
    "modes.read",
    "modes.write",
    "packs.import",
    "packs.export",
    "orchestrate.run",
    "pipeline.apply",
    "policy.override",
    "tenant.manage",
    "users.manage",
]);
export const UserSchema = z.object({
    id: z.string().min(1),
    email: z.string().email(),
    passwordHash: z.string().min(1),
    role: RoleSchema,
    tenantId: z.string().min(1),
    enabled: z.boolean().default(true),
    createdAt: z.string().optional(),
});
export const ROLE_PERMISSIONS = {
    admin: [
        "modes.read",
        "modes.write",
        "packs.import",
        "packs.export",
        "orchestrate.run",
        "pipeline.apply",
        "policy.override",
        "tenant.manage",
        "users.manage",
    ],
    developer: [
        "modes.read",
        "modes.write",
        "packs.import",
        "packs.export",
        "orchestrate.run",
        "pipeline.apply",
    ],
    viewer: ["modes.read"],
};
export function hasPermission(user, permission) {
    const perms = ROLE_PERMISSIONS[user.role] ?? [];
    return perms.includes(permission);
}
export const TOOL_PERMISSIONS = {
    "agents.plan": "orchestrate.run",
    "agents.next": "orchestrate.run",
    "agents.submit": "orchestrate.run",
    "pipeline.applyAndVerify": "pipeline.apply",
    "pack.export": "packs.export",
    "pack.import": "packs.import",
    "pack.import.url": "packs.import",
    "modes.list": "modes.read",
    "modes.get": "modes.read",
    "modes.suggest": "modes.read",
    "modes.validate": "modes.read",
    "modes.simulate": "modes.read",
    "policy.get": "modes.read",
    "policy.override": "policy.override",
};
export function getRequiredPermission(toolName) {
    return TOOL_PERMISSIONS[toolName] ?? null;
}
