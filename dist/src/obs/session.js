import crypto from "node:crypto";
export function ensureSessionId(input) {
    if (input && input.length >= 8)
        return input;
    return crypto.randomUUID();
}
