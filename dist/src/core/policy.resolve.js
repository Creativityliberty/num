export function resolveRuntimePolicy(opts) {
    return {
        model: opts.node?.model ?? opts.mode?.model ?? opts.pack?.model ?? opts.defaults?.model,
        budget: opts.node?.budget ?? opts.mode?.budget ?? opts.pack?.budget ?? opts.defaults?.budget,
        rateLimit: opts.node?.rateLimit ?? opts.mode?.rateLimit ?? opts.pack?.rateLimit ?? opts.defaults?.rateLimit,
    };
}
