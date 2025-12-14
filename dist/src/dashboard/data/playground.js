export function simulateMode(registry, modeId) {
    try {
        const result = registry.simulate(modeId);
        return { ok: true, result };
    }
    catch (e) {
        return { ok: false, error: String(e) };
    }
}
export function validateMode(registry, modeId) {
    try {
        const result = registry.validate(modeId);
        return { ok: true, result };
    }
    catch (e) {
        return { ok: false, error: String(e) };
    }
}
