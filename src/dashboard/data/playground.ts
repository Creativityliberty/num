import type { ModesRegistry } from "../../core/modes.registry.js";

export function simulateMode(registry: ModesRegistry, modeId: string) {
  try {
    const result = registry.simulate(modeId);
    return { ok: true, result };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}

export function validateMode(registry: ModesRegistry, modeId: string) {
  try {
    const result = registry.validate(modeId);
    return { ok: true, result };
  } catch (e: unknown) {
    return { ok: false, error: String(e) };
  }
}
