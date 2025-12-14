import { z } from "zod";
function unwrap(t) {
    let cur = t;
    let optional = false;
    let nullable = false;
    let defaultValue = undefined;
    while (true) {
        if (cur instanceof z.ZodOptional) {
            optional = true;
            cur = cur._def.innerType;
            continue;
        }
        if (cur instanceof z.ZodDefault) {
            defaultValue = cur._def.defaultValue();
            cur = cur._def.innerType;
            continue;
        }
        if (cur instanceof z.ZodNullable) {
            nullable = true;
            cur = cur._def.innerType;
            continue;
        }
        if (cur instanceof z.ZodEffects) {
            cur = cur._def.schema;
            continue;
        }
        break;
    }
    return { t: cur, optional, nullable, defaultValue };
}
function baseSchema(t) {
    if (t instanceof z.ZodString)
        return { type: "string" };
    if (t instanceof z.ZodNumber)
        return { type: "number" };
    if (t instanceof z.ZodBoolean)
        return { type: "boolean" };
    if (t instanceof z.ZodBigInt)
        return { type: "integer" };
    if (t instanceof z.ZodDate)
        return { type: "string", format: "date-time" };
    if (t instanceof z.ZodLiteral)
        return { const: t._def.value };
    if (t instanceof z.ZodEnum)
        return { type: "string", enum: t._def.values };
    if (t instanceof z.ZodNativeEnum) {
        const vals = Object.values(t._def.values);
        return { enum: vals.filter((v) => typeof v === "string" || typeof v === "number") };
    }
    if (t instanceof z.ZodArray) {
        const inner = t._def.type;
        return { type: "array", items: zodToJsonSchema(inner) };
    }
    if (t instanceof z.ZodObject) {
        const shape = t.shape;
        const props = {};
        const required = [];
        for (const [k, v] of Object.entries(shape)) {
            const u = unwrap(v);
            props[k] = zodToJsonSchema(u.t);
            if (u.defaultValue !== undefined)
                props[k].default = u.defaultValue;
            if (!u.optional)
                required.push(k);
            if (u.nullable)
                props[k] = { anyOf: [props[k], { type: "null" }] };
        }
        const out = { type: "object", properties: props };
        if (required.length)
            out.required = required;
        return out;
    }
    if (t instanceof z.ZodUnion) {
        const opts = t._def.options;
        return { anyOf: opts.map((o) => zodToJsonSchema(o)) };
    }
    if (t instanceof z.ZodDiscriminatedUnion) {
        const opts = Array.from(t._def.options.values());
        return { anyOf: opts.map((o) => zodToJsonSchema(o)) };
    }
    if (t instanceof z.ZodRecord) {
        return { type: "object", additionalProperties: zodToJsonSchema(t._def.valueType) };
    }
    if (t instanceof z.ZodTuple) {
        const items = t._def.items;
        return { type: "array", items: items.map((i) => zodToJsonSchema(i)) };
    }
    if (t instanceof z.ZodAny || t instanceof z.ZodUnknown) {
        return {};
    }
    return {};
}
export function zodToJsonSchema(schema) {
    const u = unwrap(schema);
    let s = baseSchema(u.t);
    if (u.defaultValue !== undefined)
        s.default = u.defaultValue;
    if (u.nullable)
        s = { anyOf: [s, { type: "null" }] };
    return s;
}
