import { z } from "zod";
import { PackBundleSchema } from "./pack.bundle.schema.js";
export const PublisherSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    publicKey: z.string().min(1),
    trusted: z.boolean().default(false),
});
export const SignedPackBundleSchema = z.object({
    bundle: PackBundleSchema,
    signature: z.string().min(1),
    publisherId: z.string().min(1),
});
export const MarketplacePackSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    version: z.string().min(1),
    publisherId: z.string().min(1),
    publisherName: z.string().optional(),
    tags: z.array(z.string()).default([]),
    downloads: z.number().int().nonnegative().default(0),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});
export const TrustPolicySchema = z.object({
    allowUnsigned: z.boolean().default(false),
    allowUntrusted: z.boolean().default(true),
    trustedPublishers: z.array(PublisherSchema).default([]),
});
