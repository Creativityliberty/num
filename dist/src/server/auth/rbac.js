export const rolePermissions = {
    admin: [
        "modes.read",
        "modes.write",
        "packs.read",
        "packs.import",
        "packs.export",
        "orchestrate.run",
        "pipeline.apply",
        "git.write",
        "policy.admin",
    ],
    developer: [
        "modes.read",
        "packs.read",
        "packs.import",
        "packs.export",
        "orchestrate.run",
        "pipeline.apply",
        "git.write",
    ],
    viewer: ["modes.read", "packs.read"],
};
export function hasPermission(user, perm) {
    const roles = user?.roles ?? [];
    for (const r of roles) {
        const perms = rolePermissions[r];
        if (perms && perms.includes(perm))
            return true;
    }
    return false;
}
export const toolToPermission = [
    { match: /^pack\.import/, perm: "packs.import" },
    { match: /^pack\.export/, perm: "packs.export" },
    { match: /^pack\./, perm: "packs.read" },
    { match: /^modes\./, perm: "modes.read" },
    { match: /^orchestrate\./, perm: "orchestrate.run" },
    { match: /^agents\./, perm: "orchestrate.run" },
    { match: /^pipeline\.applyAndVerify$/, perm: "pipeline.apply" },
    { match: /^workspace\.applyPatch$/, perm: "pipeline.apply" },
    { match: /^exec\.run$/, perm: "pipeline.apply" },
    { match: /^git\./, perm: "git.write" },
];
export function requiredPermissionForTool(tool) {
    for (const r of toolToPermission) {
        if (r.match.test(tool))
            return r.perm;
    }
    return null;
}
