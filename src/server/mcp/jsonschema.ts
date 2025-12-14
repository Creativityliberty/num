import { z } from "zod";

export type JsonSchema = Record<string, unknown>;

function unwrap(t: z.ZodTypeAny): { t: z.ZodTypeAny; optional: boolean; nullable: boolean; defaultValue?: unknown } {
  let cur: z.ZodTypeAny = t;
  let optional = false;
  let nullable = false;
  let defaultValue: unknown = undefined;

  while (true) {
    if (cur instanceof z.ZodOptional) {
      optional = true;
      cur = (cur as z.ZodOptional<z.ZodTypeAny>)._def.innerType;
      continue;
    }
    if (cur instanceof z.ZodDefault) {
      defaultValue = (cur as z.ZodDefault<z.ZodTypeAny>)._def.defaultValue();
      cur = (cur as z.ZodDefault<z.ZodTypeAny>)._def.innerType;
      continue;
    }
    if (cur instanceof z.ZodNullable) {
      nullable = true;
      cur = (cur as z.ZodNullable<z.ZodTypeAny>)._def.innerType;
      continue;
    }
    if (cur instanceof z.ZodEffects) {
      cur = (cur as z.ZodEffects<z.ZodTypeAny>)._def.schema;
      continue;
    }
    break;
  }
  return { t: cur, optional, nullable, defaultValue };
}

function baseSchema(t: z.ZodTypeAny): JsonSchema {
  if (t instanceof z.ZodString) return { type: "string" };
  if (t instanceof z.ZodNumber) return { type: "number" };
  if (t instanceof z.ZodBoolean) return { type: "boolean" };
  if (t instanceof z.ZodBigInt) return { type: "integer" };
  if (t instanceof z.ZodDate) return { type: "string", format: "date-time" };
  if (t instanceof z.ZodLiteral) return { const: (t as z.ZodLiteral<unknown>)._def.value };
  if (t instanceof z.ZodEnum) return { type: "string", enum: (t as z.ZodEnum<[string, ...string[]]>)._def.values };
  if (t instanceof z.ZodNativeEnum) {
    const vals = Object.values((t as z.ZodNativeEnum<z.EnumLike>)._def.values);
    return { enum: vals.filter((v) => typeof v === "string" || typeof v === "number") };
  }
  if (t instanceof z.ZodArray) {
    const inner = (t as z.ZodArray<z.ZodTypeAny>)._def.type;
    return { type: "array", items: zodToJsonSchema(inner) };
  }
  if (t instanceof z.ZodObject) {
    const shape = (t as z.ZodObject<z.ZodRawShape>).shape as Record<string, z.ZodTypeAny>;
    const props: Record<string, JsonSchema> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(shape)) {
      const u = unwrap(v);
      props[k] = zodToJsonSchema(u.t);
      if (u.defaultValue !== undefined) (props[k] as Record<string, unknown>).default = u.defaultValue;
      if (!u.optional) required.push(k);
      if (u.nullable) props[k] = { anyOf: [props[k], { type: "null" }] };
    }
    const out: JsonSchema = { type: "object", properties: props };
    if (required.length) out.required = required;
    return out;
  }
  if (t instanceof z.ZodUnion) {
    const opts = (t as z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>)._def.options;
    return { anyOf: opts.map((o: z.ZodTypeAny) => zodToJsonSchema(o)) };
  }
  if (t instanceof z.ZodDiscriminatedUnion) {
    const opts = Array.from((t as z.ZodDiscriminatedUnion<string, z.ZodDiscriminatedUnionOption<string>[]>)._def.options.values());
    return { anyOf: opts.map((o) => zodToJsonSchema(o)) };
  }
  if (t instanceof z.ZodRecord) {
    return { type: "object", additionalProperties: zodToJsonSchema((t as z.ZodRecord<z.ZodString, z.ZodTypeAny>)._def.valueType) };
  }
  if (t instanceof z.ZodTuple) {
    const items = (t as z.ZodTuple<[z.ZodTypeAny, ...z.ZodTypeAny[]]>)._def.items;
    return { type: "array", items: items.map((i: z.ZodTypeAny) => zodToJsonSchema(i)) };
  }
  if (t instanceof z.ZodAny || t instanceof z.ZodUnknown) {
    return {};
  }
  return {};
}

export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchema {
  const u = unwrap(schema);
  let s = baseSchema(u.t);
  if (u.defaultValue !== undefined) (s as Record<string, unknown>).default = u.defaultValue;
  if (u.nullable) s = { anyOf: [s, { type: "null" }] };
  return s;
}
