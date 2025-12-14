import { z } from "zod";
export declare const PlanPayloadSchema: z.ZodObject<{
    phases: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        steps: z.ZodArray<z.ZodUnknown, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        steps: unknown[];
    }, {
        title: string;
        steps: unknown[];
    }>, "many">;
    acceptanceCriteria: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    verification: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    risks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    assumptions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    phases: {
        title: string;
        steps: unknown[];
    }[];
    acceptanceCriteria: string[];
    verification: string[];
    risks: string[];
    assumptions: string[];
}, {
    phases: {
        title: string;
        steps: unknown[];
    }[];
    acceptanceCriteria?: string[] | undefined;
    verification?: string[] | undefined;
    risks?: string[] | undefined;
    assumptions?: string[] | undefined;
}>;
export declare const RunOutputPayloadSchema: z.ZodObject<{
    patch: z.ZodString;
    commands: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    pr: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        body?: string | undefined;
    }, {
        title?: string | undefined;
        body?: string | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodObject<{
        assumptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        risks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rollback: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        risks?: string[] | undefined;
        assumptions?: string[] | undefined;
        rollback?: string | undefined;
    }, {
        risks?: string[] | undefined;
        assumptions?: string[] | undefined;
        rollback?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patch: string;
    commands: string[];
    pr?: {
        title?: string | undefined;
        body?: string | undefined;
    } | undefined;
    notes?: {
        risks?: string[] | undefined;
        assumptions?: string[] | undefined;
        rollback?: string | undefined;
    } | undefined;
}, {
    patch: string;
    commands?: string[] | undefined;
    pr?: {
        title?: string | undefined;
        body?: string | undefined;
    } | undefined;
    notes?: {
        risks?: string[] | undefined;
        assumptions?: string[] | undefined;
        rollback?: string | undefined;
    } | undefined;
}>;
export declare const ReviewOutputPayloadSchema: z.ZodObject<{
    severity: z.ZodEnum<["low", "medium", "high", "blocker"]>;
    findings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        message: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: string;
        location?: string | undefined;
    }, {
        message: string;
        type: string;
        location?: string | undefined;
    }>, "many">>>;
    recommendedCommands: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    approval: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    severity: "low" | "medium" | "high" | "blocker";
    findings: {
        message: string;
        type: string;
        location?: string | undefined;
    }[];
    recommendedCommands: string[];
    approval: boolean;
}, {
    severity: "low" | "medium" | "high" | "blocker";
    approval: boolean;
    findings?: {
        message: string;
        type: string;
        location?: string | undefined;
    }[] | undefined;
    recommendedCommands?: string[] | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map