export function promptPackToMessages(promptPack) {
    const pack = promptPack;
    if (!pack)
        return [];
    const messages = [];
    const system = typeof pack.system === "string" ? pack.system : "";
    const developer = typeof pack.developer === "string" ? pack.developer : "";
    if (system.trim())
        messages.push({ role: "system", content: system });
    if (developer.trim())
        messages.push({ role: "developer", content: developer });
    if (pack.task && typeof pack.task === "object") {
        const task = pack.task;
        const goal = String(task.goal ?? "").trim();
        const context = task.context ?? {};
        const user = [
            "GOAL:",
            goal || "(none)",
            "",
            "CONTEXT (JSON):",
            JSON.stringify(context, null, 2),
        ].join("\n");
        messages.push({ role: "user", content: user });
    }
    else if (typeof pack.user === "string") {
        messages.push({ role: "user", content: pack.user });
    }
    else if (typeof pack.prompt === "string") {
        messages.push({ role: "user", content: pack.prompt });
    }
    else {
        messages.push({ role: "user", content: JSON.stringify(pack, null, 2) });
    }
    return messages;
}
//# sourceMappingURL=normalize.js.map