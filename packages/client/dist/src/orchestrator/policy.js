export function explainManualNextStep(step) {
    const tools = step.suggestedTools?.length ? ` Suggested tools: ${step.suggestedTools.join(", ")}` : "";
    return `${step.message}${tools}`;
}
export function formatPolicyBlockHint(msg) {
    if (/allowWrite/i.test(msg))
        return `${msg} (Enable allowWrite in policy, or apply patch manually in IDE.)`;
    if (/allowExec/i.test(msg))
        return `${msg} (Enable allowExec in policy, or run commands manually in IDE.)`;
    if (/allowGit/i.test(msg))
        return `${msg} (Enable allowGit in policy, or handle git manually.)`;
    return msg;
}
//# sourceMappingURL=policy.js.map