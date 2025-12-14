import { z } from "zod";
export declare const ModelRefSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider?: string;
    model?: string;
}, {
    provider?: string;
    model?: string;
}>;
export declare const ModelAttemptSchema: z.ZodObject<{
    model: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider?: string;
        model?: string;
    }, {
        provider?: string;
        model?: string;
    }>;
    ok: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
    transient: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    model?: {
        provider?: string;
        model?: string;
    };
    ok?: boolean;
    reason?: string;
    transient?: boolean;
}, {
    model?: {
        provider?: string;
        model?: string;
    };
    ok?: boolean;
    reason?: string;
    transient?: boolean;
}>;
export declare const ModelUsageSchema: z.ZodObject<{
    inputTokens: z.ZodOptional<z.ZodNumber>;
    outputTokens: z.ZodOptional<z.ZodNumber>;
    costUsd: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
}, {
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
}>;
export declare const ModelTelemetryEventSchema: z.ZodObject<{
    ts: z.ZodString;
    runId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
    jobId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    chosenModel: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider?: string;
        model?: string;
    }, {
        provider?: string;
        model?: string;
    }>>;
    attempts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        model: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>;
        ok: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
        transient: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        model?: {
            provider?: string;
            model?: string;
        };
        ok?: boolean;
        reason?: string;
        transient?: boolean;
    }, {
        model?: {
            provider?: string;
            model?: string;
        };
        ok?: boolean;
        reason?: string;
        transient?: boolean;
    }>, "many">>;
    usage: z.ZodOptional<z.ZodObject<{
        inputTokens: z.ZodOptional<z.ZodNumber>;
        outputTokens: z.ZodOptional<z.ZodNumber>;
        costUsd: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        inputTokens?: number;
        outputTokens?: number;
        costUsd?: number;
    }, {
        inputTokens?: number;
        outputTokens?: number;
        costUsd?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    ts?: string;
    runId?: string;
    stepId?: string;
    jobId?: string;
    role?: string;
    chosenModel?: {
        provider?: string;
        model?: string;
    };
    attempts?: {
        model?: {
            provider?: string;
            model?: string;
        };
        ok?: boolean;
        reason?: string;
        transient?: boolean;
    }[];
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        costUsd?: number;
    };
}, {
    ts?: string;
    runId?: string;
    stepId?: string;
    jobId?: string;
    role?: string;
    chosenModel?: {
        provider?: string;
        model?: string;
    };
    attempts?: {
        model?: {
            provider?: string;
            model?: string;
        };
        ok?: boolean;
        reason?: string;
        transient?: boolean;
    }[];
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        costUsd?: number;
    };
}>;
export type ModelTelemetryEvent = z.infer<typeof ModelTelemetryEventSchema>;
export declare const RawModeSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const UniversalModeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodArray<z.ZodString, "many">;
    categoryPath: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    prompts: z.ZodObject<{
        system: z.ZodOptional<z.ZodString>;
        developer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        system?: string;
        developer?: string;
    }, {
        system?: string;
        developer?: string;
    }>;
    source: z.ZodObject<{
        path: z.ZodString;
        raw: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        path?: string;
        raw?: unknown;
    }, {
        path?: string;
        raw?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    categoryPath?: string[];
    prompts?: {
        system?: string;
        developer?: string;
    };
    source?: {
        path?: string;
        raw?: unknown;
    };
}, {
    id?: string;
    name?: string;
    description?: string;
    tags?: string[];
    categoryPath?: string[];
    prompts?: {
        system?: string;
        developer?: string;
    };
    source?: {
        path?: string;
        raw?: unknown;
    };
}>;
export type UniversalMode = z.infer<typeof UniversalModeSchema>;
export declare const ModesListInputSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    tag?: string;
    category?: string;
}, {
    query?: string;
    tag?: string;
    category?: string;
}>;
export declare const ModesGetInputSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const SessionSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
}, {
    sessionId?: string;
}>;
export declare const TaskEnvelopeSchema: z.ZodObject<{
    goal: z.ZodString;
    context: z.ZodOptional<z.ZodObject<{
        repoName: z.ZodOptional<z.ZodString>;
        openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        errors: z.ZodOptional<z.ZodString>;
        diff: z.ZodOptional<z.ZodString>;
        techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        repoName?: string;
        openFiles?: string[];
        errors?: string;
        diff?: string;
        techStack?: string[];
    }, {
        repoName?: string;
        openFiles?: string[];
        errors?: string;
        diff?: string;
        techStack?: string[];
    }>>;
    constraints: z.ZodOptional<z.ZodObject<{
        qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
        timeBudget: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        qualityBar?: "draft" | "normal" | "high";
        timeBudget?: string;
    }, {
        qualityBar?: "draft" | "normal" | "high";
        timeBudget?: string;
    }>>;
    permissions: z.ZodOptional<z.ZodObject<{
        readFs: z.ZodOptional<z.ZodBoolean>;
        writeFs: z.ZodOptional<z.ZodBoolean>;
        runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        git: z.ZodOptional<z.ZodBoolean>;
        network: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        git?: boolean;
        readFs?: boolean;
        writeFs?: boolean;
        runCommands?: string[];
        network?: boolean;
    }, {
        git?: boolean;
        readFs?: boolean;
        writeFs?: boolean;
        runCommands?: string[];
        network?: boolean;
    }>>;
    modelPreference: z.ZodOptional<z.ZodObject<{
        provider: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider?: string;
        model?: string;
    }, {
        provider?: string;
        model?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    goal?: string;
    context?: {
        repoName?: string;
        openFiles?: string[];
        errors?: string;
        diff?: string;
        techStack?: string[];
    };
    constraints?: {
        qualityBar?: "draft" | "normal" | "high";
        timeBudget?: string;
    };
    permissions?: {
        git?: boolean;
        readFs?: boolean;
        writeFs?: boolean;
        runCommands?: string[];
        network?: boolean;
    };
    modelPreference?: {
        provider?: string;
        model?: string;
    };
}, {
    goal?: string;
    context?: {
        repoName?: string;
        openFiles?: string[];
        errors?: string;
        diff?: string;
        techStack?: string[];
    };
    constraints?: {
        qualityBar?: "draft" | "normal" | "high";
        timeBudget?: string;
    };
    permissions?: {
        git?: boolean;
        readFs?: boolean;
        writeFs?: boolean;
        runCommands?: string[];
        network?: boolean;
    };
    modelPreference?: {
        provider?: string;
        model?: string;
    };
}>;
export type TaskEnvelope = z.infer<typeof TaskEnvelopeSchema>;
export declare const ModesSuggestInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    topK?: number;
}, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    topK?: number;
}>;
export declare const ModesRenderInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    id: z.ZodString;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
    outputFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["auto", "plan", "patch", "checklist"]>>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    outputFormat?: "auto" | "plan" | "patch" | "checklist";
}, {
    id?: string;
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    outputFormat?: "auto" | "plan" | "patch" | "checklist";
}>;
export type ModesRenderInput = z.infer<typeof ModesRenderInputSchema>;
export declare const ModesPlanInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    modeId: z.ZodOptional<z.ZodString>;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
    style: z.ZodDefault<z.ZodOptional<z.ZodEnum<["plan", "checklist"]>>>;
    depth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
    style?: "plan" | "checklist";
    depth?: number;
}, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
    style?: "plan" | "checklist";
    depth?: number;
}>;
export declare const PlanPhaseSchema: z.ZodObject<{
    title: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        action: z.ZodString;
        details: z.ZodOptional<z.ZodString>;
        expectedOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        action?: string;
        details?: string;
        expectedOutput?: string;
    }, {
        id?: string;
        action?: string;
        details?: string;
        expectedOutput?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title?: string;
    steps?: {
        id?: string;
        action?: string;
        details?: string;
        expectedOutput?: string;
    }[];
}, {
    title?: string;
    steps?: {
        id?: string;
        action?: string;
        details?: string;
        expectedOutput?: string;
    }[];
}>;
export declare const PlanResultSchema: z.ZodObject<{
    sessionId: z.ZodString;
    selectedMode: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        confidence: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        confidence?: number;
    }, {
        id?: string;
        name?: string;
        confidence?: number;
    }>>;
    style: z.ZodEnum<["plan", "checklist"]>;
    phases: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        steps: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            action: z.ZodString;
            details: z.ZodOptional<z.ZodString>;
            expectedOutput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            action?: string;
            details?: string;
            expectedOutput?: string;
        }, {
            id?: string;
            action?: string;
            details?: string;
            expectedOutput?: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title?: string;
        steps?: {
            id?: string;
            action?: string;
            details?: string;
            expectedOutput?: string;
        }[];
    }, {
        title?: string;
        steps?: {
            id?: string;
            action?: string;
            details?: string;
            expectedOutput?: string;
        }[];
    }>, "many">;
    acceptanceCriteria: z.ZodArray<z.ZodString, "many">;
    verification: z.ZodArray<z.ZodString, "many">;
    risks: z.ZodArray<z.ZodString, "many">;
    assumptions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    style?: "plan" | "checklist";
    selectedMode?: {
        id?: string;
        name?: string;
        confidence?: number;
    };
    phases?: {
        title?: string;
        steps?: {
            id?: string;
            action?: string;
            details?: string;
            expectedOutput?: string;
        }[];
    }[];
    acceptanceCriteria?: string[];
    verification?: string[];
    risks?: string[];
    assumptions?: string[];
}, {
    sessionId?: string;
    style?: "plan" | "checklist";
    selectedMode?: {
        id?: string;
        name?: string;
        confidence?: number;
    };
    phases?: {
        title?: string;
        steps?: {
            id?: string;
            action?: string;
            details?: string;
            expectedOutput?: string;
        }[];
    }[];
    acceptanceCriteria?: string[];
    verification?: string[];
    risks?: string[];
    assumptions?: string[];
}>;
export type PlanResult = z.infer<typeof PlanResultSchema>;
export declare const ModesPlanPromptInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    modeId: z.ZodOptional<z.ZodString>;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
    style: z.ZodDefault<z.ZodOptional<z.ZodEnum<["plan", "checklist"]>>>;
    depth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
    style?: "plan" | "checklist";
    depth?: number;
}, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
    style?: "plan" | "checklist";
    depth?: number;
}>;
export declare const ModesRunPromptInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    modeId: z.ZodOptional<z.ZodString>;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
}, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
}>;
export declare const ModesReviewPromptInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    modeId: z.ZodString;
    patch: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    patch?: string;
    modeId?: string;
}, {
    sessionId?: string;
    patch?: string;
    modeId?: string;
}>;
export declare const WorkspaceApplyPatchInputSchema: z.ZodObject<{
    sessionId: z.ZodString;
    diff: z.ZodString;
    workspaceRoot: z.ZodString;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    workspaceRoot?: string;
    sessionId?: string;
    diff?: string;
    dryRun?: boolean;
}, {
    workspaceRoot?: string;
    sessionId?: string;
    diff?: string;
    dryRun?: boolean;
}>;
export declare const ExecRunInputSchema: z.ZodObject<{
    sessionId: z.ZodString;
    cmd: z.ZodString;
    args: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    cwd: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    cmd?: string;
    args?: string[];
    cwd?: string;
    timeoutMs?: number;
}, {
    sessionId?: string;
    cmd?: string;
    args?: string[];
    cwd?: string;
    timeoutMs?: number;
}>;
export declare const ExecRunInputSchemaLegacy: z.ZodObject<{
    sessionId: z.ZodString;
    command: z.ZodString;
    cwd: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    cwd?: string;
    timeoutMs?: number;
    command?: string;
}, {
    sessionId?: string;
    cwd?: string;
    timeoutMs?: number;
    command?: string;
}>;
export declare const RunBundleOutputSchema: z.ZodObject<{
    patch: z.ZodString;
    commands: z.ZodArray<z.ZodString, "many">;
    pr: z.ZodObject<{
        title: z.ZodString;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title?: string;
        body?: string;
    }, {
        title?: string;
        body?: string;
    }>;
    notes: z.ZodObject<{
        assumptions: z.ZodArray<z.ZodString, "many">;
        risks: z.ZodArray<z.ZodString, "many">;
        rollback: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    }, {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    patch?: string;
    commands?: string[];
    pr?: {
        title?: string;
        body?: string;
    };
    notes?: {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    };
}, {
    patch?: string;
    commands?: string[];
    pr?: {
        title?: string;
        body?: string;
    };
    notes?: {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    };
}>;
export declare const ReviewOutputSchema: z.ZodObject<{
    severity: z.ZodEnum<["low", "medium", "high", "blocker"]>;
    findings: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["bug", "test", "security", "style", "perf", "docs"]>;
        message: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        type?: "style" | "bug" | "test" | "security" | "perf" | "docs";
        location?: string;
    }, {
        message?: string;
        type?: "style" | "bug" | "test" | "security" | "perf" | "docs";
        location?: string;
    }>, "many">;
    recommendedCommands: z.ZodArray<z.ZodString, "many">;
    approval: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    severity?: "high" | "low" | "medium" | "blocker";
    findings?: {
        message?: string;
        type?: "style" | "bug" | "test" | "security" | "perf" | "docs";
        location?: string;
    }[];
    recommendedCommands?: string[];
    approval?: boolean;
}, {
    severity?: "high" | "low" | "medium" | "blocker";
    findings?: {
        message?: string;
        type?: "style" | "bug" | "test" | "security" | "perf" | "docs";
        location?: string;
    }[];
    recommendedCommands?: string[];
    approval?: boolean;
}>;
export declare const ApplyPatchResultSchema: z.ZodObject<{
    applied: z.ZodBoolean;
    dryRun: z.ZodBoolean;
    filesChanged: z.ZodNumber;
    insertions: z.ZodNumber;
    deletions: z.ZodNumber;
    errors: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    errors?: string[];
    dryRun?: boolean;
    applied?: boolean;
    filesChanged?: number;
    insertions?: number;
    deletions?: number;
}, {
    errors?: string[];
    dryRun?: boolean;
    applied?: boolean;
    filesChanged?: number;
    insertions?: number;
    deletions?: number;
}>;
export declare const ExecResultSchema: z.ZodObject<{
    exitCode: z.ZodNumber;
    stdout: z.ZodString;
    stderr: z.ZodString;
    durationMs: z.ZodNumber;
    truncated: z.ZodBoolean;
    command: z.ZodString;
}, "strip", z.ZodTypeAny, {
    command?: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    durationMs?: number;
    truncated?: boolean;
}, {
    command?: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    durationMs?: number;
    truncated?: boolean;
}>;
export declare const GitStatusInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
}, {
    sessionId?: string;
}>;
export declare const GitDiffInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    staged: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    paths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    staged?: boolean;
    paths?: string[];
}, {
    sessionId?: string;
    staged?: boolean;
    paths?: string[];
}>;
export declare const GitLogInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    limit?: number;
}, {
    sessionId?: string;
    limit?: number;
}>;
export declare const GitBranchCreateInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    sessionId?: string;
}, {
    name?: string;
    sessionId?: string;
}>;
export declare const GitCommitInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    addAll: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    sessionId?: string;
    dryRun?: boolean;
    addAll?: boolean;
}, {
    message?: string;
    sessionId?: string;
    dryRun?: boolean;
    addAll?: boolean;
}>;
export declare const PipelineApplyAndVerifyInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    diff: z.ZodString;
    commands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    timeoutMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    diff?: string;
    dryRun?: boolean;
    timeoutMs?: number;
    commands?: string[];
}, {
    sessionId?: string;
    diff?: string;
    dryRun?: boolean;
    timeoutMs?: number;
    commands?: string[];
}>;
export declare const BundlePrCreateInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    modeId: z.ZodOptional<z.ZodString>;
    task: z.ZodOptional<z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>>;
    plan: z.ZodOptional<z.ZodUnknown>;
    runOutput: z.ZodOptional<z.ZodUnknown>;
    reviewOutput: z.ZodOptional<z.ZodUnknown>;
    execResults: z.ZodOptional<z.ZodUnknown>;
    git: z.ZodOptional<z.ZodObject<{
        branch: z.ZodOptional<z.ZodString>;
        commitSha: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        branch?: string;
        commitSha?: string;
    }, {
        branch?: string;
        commitSha?: string;
    }>>;
    writeFile: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    git?: {
        branch?: string;
        commitSha?: string;
    };
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    plan?: unknown;
    modeId?: string;
    runOutput?: unknown;
    reviewOutput?: unknown;
    execResults?: unknown;
    writeFile?: boolean;
}, {
    git?: {
        branch?: string;
        commitSha?: string;
    };
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    plan?: unknown;
    modeId?: string;
    runOutput?: unknown;
    reviewOutput?: unknown;
    execResults?: unknown;
    writeFile?: boolean;
}>;
export declare const OrchestrateFlowSchema: z.ZodObject<{
    usePlanPrompt: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    useReview: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    autoApply: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    autoCommit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    createBranch: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    branchName: z.ZodOptional<z.ZodString>;
    commitMessage: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    maxFixIterations: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    dryRun?: boolean;
    usePlanPrompt?: boolean;
    useReview?: boolean;
    autoApply?: boolean;
    autoCommit?: boolean;
    createBranch?: boolean;
    branchName?: string;
    commitMessage?: string;
    maxFixIterations?: number;
}, {
    dryRun?: boolean;
    usePlanPrompt?: boolean;
    useReview?: boolean;
    autoApply?: boolean;
    autoCommit?: boolean;
    createBranch?: boolean;
    branchName?: string;
    commitMessage?: string;
    maxFixIterations?: number;
}>;
export declare const OrchestrateRunInputSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
    modeId: z.ZodOptional<z.ZodString>;
    flow: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        usePlanPrompt: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        useReview: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        autoApply: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        autoCommit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        createBranch: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        branchName: z.ZodOptional<z.ZodString>;
        commitMessage: z.ZodOptional<z.ZodString>;
        dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        maxFixIterations: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    }, {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    }>>>;
}, "strip", z.ZodTypeAny, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
    flow?: {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    };
}, {
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    modeId?: string;
    flow?: {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    };
}>;
export declare const OrchestrateContinueInputSchema: z.ZodObject<{
    runId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    stepId: z.ZodEnum<["plan", "run", "review"]>;
    payload: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    runId?: string;
    stepId?: "plan" | "run" | "review";
    sessionId?: string;
    payload?: unknown;
}, {
    runId?: string;
    stepId?: "plan" | "run" | "review";
    sessionId?: string;
    payload?: unknown;
}>;
export declare const OrchestrateStatusInputSchema: z.ZodObject<{
    runId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runId?: string;
}, {
    runId?: string;
}>;
export declare const OrchestrateCancelInputSchema: z.ZodObject<{
    runId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runId?: string;
}, {
    runId?: string;
}>;
export declare const PlanPayloadSchema: z.ZodObject<{
    phases: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        steps: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        title?: string;
        steps?: any[];
    }, {
        title?: string;
        steps?: any[];
    }>, "many">;
    acceptanceCriteria: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    verification: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    risks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    assumptions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    phases?: {
        title?: string;
        steps?: any[];
    }[];
    acceptanceCriteria?: string[];
    verification?: string[];
    risks?: string[];
    assumptions?: string[];
}, {
    phases?: {
        title?: string;
        steps?: any[];
    }[];
    acceptanceCriteria?: string[];
    verification?: string[];
    risks?: string[];
    assumptions?: string[];
}>;
export declare const RunOutputPayloadSchema: z.ZodObject<{
    patch: z.ZodString;
    commands: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    pr: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string;
        body?: string;
    }, {
        title?: string;
        body?: string;
    }>>;
    notes: z.ZodOptional<z.ZodObject<{
        assumptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        risks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rollback: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    }, {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    patch?: string;
    commands?: string[];
    pr?: {
        title?: string;
        body?: string;
    };
    notes?: {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    };
}, {
    patch?: string;
    commands?: string[];
    pr?: {
        title?: string;
        body?: string;
    };
    notes?: {
        risks?: string[];
        assumptions?: string[];
        rollback?: string;
    };
}>;
export declare const ReviewOutputPayloadSchema: z.ZodObject<{
    severity: z.ZodEnum<["low", "medium", "high", "blocker"]>;
    findings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        message: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        type?: string;
        location?: string;
    }, {
        message?: string;
        type?: string;
        location?: string;
    }>, "many">>>;
    recommendedCommands: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    approval: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    severity?: "high" | "low" | "medium" | "blocker";
    findings?: {
        message?: string;
        type?: string;
        location?: string;
    }[];
    recommendedCommands?: string[];
    approval?: boolean;
}, {
    severity?: "high" | "low" | "medium" | "blocker";
    findings?: {
        message?: string;
        type?: string;
        location?: string;
    }[];
    recommendedCommands?: string[];
    approval?: boolean;
}>;
export declare const OrchestrateStateSchema: z.ZodEnum<["INIT", "MODE_SELECTED", "NEEDS_PLAN", "NEEDS_PATCH", "NEEDS_REVIEW", "READY_TO_APPLY", "APPLIED_AND_VERIFIED", "BRANCHED", "COMMITTED", "BUNDLED", "DONE", "FAILED", "CANCELLED"]>;
export declare const RollbackRecordSchema: z.ZodObject<{
    ts: z.ZodString;
    kind: z.ZodEnum<["manual", "auto"]>;
    ok: z.ZodBoolean;
    runId: z.ZodString;
    restoredCount: z.ZodOptional<z.ZodNumber>;
    restored: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    ok?: boolean;
    ts?: string;
    runId?: string;
    kind?: "auto" | "manual";
    restoredCount?: number;
    restored?: string[];
}, {
    message?: string;
    ok?: boolean;
    ts?: string;
    runId?: string;
    kind?: "auto" | "manual";
    restoredCount?: number;
    restored?: string[];
}>;
export declare const OrchestrateRunRecordSchema: z.ZodObject<{
    runId: z.ZodString;
    sessionId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    state: z.ZodEnum<["INIT", "MODE_SELECTED", "NEEDS_PLAN", "NEEDS_PATCH", "NEEDS_REVIEW", "READY_TO_APPLY", "APPLIED_AND_VERIFIED", "BRANCHED", "COMMITTED", "BUNDLED", "DONE", "FAILED", "CANCELLED"]>;
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodObject<{
            repoName: z.ZodOptional<z.ZodString>;
            openFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            errors: z.ZodOptional<z.ZodString>;
            diff: z.ZodOptional<z.ZodString>;
            techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }, {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        }>>;
        constraints: z.ZodOptional<z.ZodObject<{
            qualityBar: z.ZodOptional<z.ZodEnum<["draft", "normal", "high"]>>;
            timeBudget: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }, {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        }>>;
        permissions: z.ZodOptional<z.ZodObject<{
            readFs: z.ZodOptional<z.ZodBoolean>;
            writeFs: z.ZodOptional<z.ZodBoolean>;
            runCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            git: z.ZodOptional<z.ZodBoolean>;
            network: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }, {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        }>>;
        modelPreference: z.ZodOptional<z.ZodObject<{
            provider: z.ZodOptional<z.ZodString>;
            model: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }, {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    }>;
    flow: z.ZodObject<{
        usePlanPrompt: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        useReview: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        autoApply: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        autoCommit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        createBranch: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        branchName: z.ZodOptional<z.ZodString>;
        commitMessage: z.ZodOptional<z.ZodString>;
        dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        maxFixIterations: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    }, {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    }>;
    selectedMode: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        confidence: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        confidence?: number;
    }, {
        id?: string;
        name?: string;
        confidence?: number;
    }>>;
    plan: z.ZodOptional<z.ZodUnknown>;
    runOutput: z.ZodOptional<z.ZodUnknown>;
    reviewOutput: z.ZodOptional<z.ZodUnknown>;
    pipeline: z.ZodOptional<z.ZodUnknown>;
    git: z.ZodOptional<z.ZodObject<{
        branch: z.ZodOptional<z.ZodString>;
        commitSha: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        branch?: string;
        commitSha?: string;
    }, {
        branch?: string;
        commitSha?: string;
    }>>;
    bundlePath: z.ZodOptional<z.ZodString>;
    fixIterations: z.ZodDefault<z.ZodNumber>;
    history: z.ZodDefault<z.ZodArray<z.ZodObject<{
        ts: z.ZodString;
        from: z.ZodEnum<["INIT", "MODE_SELECTED", "NEEDS_PLAN", "NEEDS_PATCH", "NEEDS_REVIEW", "READY_TO_APPLY", "APPLIED_AND_VERIFIED", "BRANCHED", "COMMITTED", "BUNDLED", "DONE", "FAILED", "CANCELLED"]>;
        to: z.ZodEnum<["INIT", "MODE_SELECTED", "NEEDS_PLAN", "NEEDS_PATCH", "NEEDS_REVIEW", "READY_TO_APPLY", "APPLIED_AND_VERIFIED", "BRANCHED", "COMMITTED", "BUNDLED", "DONE", "FAILED", "CANCELLED"]>;
        note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ts?: string;
        from?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        to?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        note?: string;
    }, {
        ts?: string;
        from?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        to?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        note?: string;
    }>, "many">>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code?: string;
        message?: string;
    }, {
        code?: string;
        message?: string;
    }>>;
    rollback: z.ZodOptional<z.ZodObject<{
        ts: z.ZodString;
        kind: z.ZodEnum<["manual", "auto"]>;
        ok: z.ZodBoolean;
        runId: z.ZodString;
        restoredCount: z.ZodOptional<z.ZodNumber>;
        restored: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        ok?: boolean;
        ts?: string;
        runId?: string;
        kind?: "auto" | "manual";
        restoredCount?: number;
        restored?: string[];
    }, {
        message?: string;
        ok?: boolean;
        ts?: string;
        runId?: string;
        kind?: "auto" | "manual";
        restoredCount?: number;
        restored?: string[];
    }>>;
    agents: z.ZodOptional<z.ZodLazy<z.ZodObject<{
        jobs: z.ZodDefault<z.ZodArray<z.ZodObject<{
            jobId: z.ZodString;
            role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
            goal: z.ZodString;
            dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
            startedAt: z.ZodOptional<z.ZodString>;
            finishedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }, {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }>, "many">>;
        artifacts: z.ZodDefault<z.ZodObject<{
            multiPlan: z.ZodOptional<z.ZodObject<{
                jobs: z.ZodArray<z.ZodObject<{
                    jobId: z.ZodString;
                    role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
                    goal: z.ZodString;
                    dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                    status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
                    startedAt: z.ZodOptional<z.ZodString>;
                    finishedAt: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }, {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }>, "many">;
                acceptanceCriteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            }, {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            }>>;
            candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
                candidateId: z.ZodString;
                patch: z.ZodString;
                commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    cmd: z.ZodString;
                    args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    cmd?: string;
                    args?: string[];
                }, {
                    cmd?: string;
                    args?: string[];
                }>, "many">>;
                rationale: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }, {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }>, "many">>;
            chosenCandidateId: z.ZodOptional<z.ZodString>;
            patchCandidate: z.ZodOptional<z.ZodObject<{
                candidateId: z.ZodString;
                patch: z.ZodString;
                commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    cmd: z.ZodString;
                    args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    cmd?: string;
                    args?: string[];
                }, {
                    cmd?: string;
                    args?: string[];
                }>, "many">>;
                rationale: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }, {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }>>;
            review: z.ZodOptional<z.ZodObject<{
                verdict: z.ZodEnum<["approve", "changes", "reject"]>;
                summary: z.ZodOptional<z.ZodString>;
                findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    severity: z.ZodDefault<z.ZodEnum<["info", "low", "medium", "high", "critical"]>>;
                    type: z.ZodString;
                    message: z.ZodString;
                    files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }, {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            }, {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            }>>;
            security: z.ZodOptional<z.ZodObject<{
                verdict: z.ZodEnum<["allow", "block", "manualConfirm"]>;
                summary: z.ZodOptional<z.ZodString>;
                issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    type: z.ZodString;
                    message: z.ZodString;
                    severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
                }, "strip", z.ZodTypeAny, {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }, {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            }, {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            }>>;
            flow: z.ZodOptional<z.ZodLazy<z.ZodObject<{
                version: z.ZodDefault<z.ZodLiteral<"1">>;
                name: z.ZodOptional<z.ZodString>;
                nodes: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
                    goal: z.ZodString;
                    expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
                    prompt: z.ZodObject<{
                        system: z.ZodString;
                        user: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        system?: string;
                        user?: string;
                    }, {
                        system?: string;
                        user?: string;
                    }>;
                    outputKey: z.ZodOptional<z.ZodString>;
                    runtimePolicy: z.ZodOptional<z.ZodObject<{
                        model: z.ZodOptional<z.ZodObject<{
                            preferred: z.ZodOptional<z.ZodObject<{
                                provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                                model: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }, {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }>>;
                            fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                                model: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }, {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }>, "many">>;
                        }, "strip", z.ZodTypeAny, {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        }, {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        }>>;
                        budget: z.ZodOptional<z.ZodObject<{
                            maxTokens: z.ZodOptional<z.ZodNumber>;
                            maxCostUsd: z.ZodOptional<z.ZodNumber>;
                        }, "strip", z.ZodTypeAny, {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        }, {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        }>>;
                        rateLimit: z.ZodOptional<z.ZodObject<{
                            rpm: z.ZodOptional<z.ZodNumber>;
                            tpm: z.ZodOptional<z.ZodNumber>;
                        }, "strip", z.ZodTypeAny, {
                            rpm?: number;
                            tpm?: number;
                        }, {
                            rpm?: number;
                            tpm?: number;
                        }>>;
                    }, "strip", z.ZodTypeAny, {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    }, {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }, {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }>, "many">;
                edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
                    from: z.ZodString;
                    to: z.ZodString;
                    kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
                }, "strip", z.ZodTypeAny, {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }, {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            }, {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            }>>>;
            byNode: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            security?: {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            };
            flow?: {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            };
            review?: {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            };
            multiPlan?: {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            };
            candidates?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }[];
            chosenCandidateId?: string;
            patchCandidate?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            };
            byNode?: Record<string, any>;
        }, {
            security?: {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            };
            flow?: {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            };
            review?: {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            };
            multiPlan?: {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            };
            candidates?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }[];
            chosenCandidateId?: string;
            patchCandidate?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            };
            byNode?: Record<string, any>;
        }>>;
        activeJobId: z.ZodOptional<z.ZodString>;
        fixIterations: z.ZodDefault<z.ZodNumber>;
        parallelReview: z.ZodDefault<z.ZodBoolean>;
        consensusImplement: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fixIterations?: number;
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
        artifacts?: {
            security?: {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            };
            flow?: {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            };
            review?: {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            };
            multiPlan?: {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            };
            candidates?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }[];
            chosenCandidateId?: string;
            patchCandidate?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            };
            byNode?: Record<string, any>;
        };
        activeJobId?: string;
        parallelReview?: boolean;
        consensusImplement?: boolean;
    }, {
        fixIterations?: number;
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
        artifacts?: {
            security?: {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            };
            flow?: {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            };
            review?: {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            };
            multiPlan?: {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            };
            candidates?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }[];
            chosenCandidateId?: string;
            patchCandidate?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            };
            byNode?: Record<string, any>;
        };
        activeJobId?: string;
        parallelReview?: boolean;
        consensusImplement?: boolean;
    }>>>;
    telemetry: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ts: z.ZodString;
        runId: z.ZodString;
        stepId: z.ZodOptional<z.ZodString>;
        jobId: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        chosenModel: z.ZodOptional<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider?: string;
            model?: string;
        }, {
            provider?: string;
            model?: string;
        }>>;
        attempts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            model: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                provider?: string;
                model?: string;
            }, {
                provider?: string;
                model?: string;
            }>;
            ok: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            transient: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            model?: {
                provider?: string;
                model?: string;
            };
            ok?: boolean;
            reason?: string;
            transient?: boolean;
        }, {
            model?: {
                provider?: string;
                model?: string;
            };
            ok?: boolean;
            reason?: string;
            transient?: boolean;
        }>, "many">>;
        usage: z.ZodOptional<z.ZodObject<{
            inputTokens: z.ZodOptional<z.ZodNumber>;
            outputTokens: z.ZodOptional<z.ZodNumber>;
            costUsd: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
        }, {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        ts?: string;
        runId?: string;
        stepId?: string;
        jobId?: string;
        role?: string;
        chosenModel?: {
            provider?: string;
            model?: string;
        };
        attempts?: {
            model?: {
                provider?: string;
                model?: string;
            };
            ok?: boolean;
            reason?: string;
            transient?: boolean;
        }[];
        usage?: {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
        };
    }, {
        ts?: string;
        runId?: string;
        stepId?: string;
        jobId?: string;
        role?: string;
        chosenModel?: {
            provider?: string;
            model?: string;
        };
        attempts?: {
            model?: {
                provider?: string;
                model?: string;
            };
            ok?: boolean;
            reason?: string;
            transient?: boolean;
        }[];
        usage?: {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
        };
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    git?: {
        branch?: string;
        commitSha?: string;
    };
    runId?: string;
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    plan?: unknown;
    selectedMode?: {
        id?: string;
        name?: string;
        confidence?: number;
    };
    rollback?: {
        message?: string;
        ok?: boolean;
        ts?: string;
        runId?: string;
        kind?: "auto" | "manual";
        restoredCount?: number;
        restored?: string[];
    };
    runOutput?: unknown;
    reviewOutput?: unknown;
    flow?: {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    };
    createdAt?: string;
    updatedAt?: string;
    state?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
    pipeline?: unknown;
    bundlePath?: string;
    fixIterations?: number;
    history?: {
        ts?: string;
        from?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        to?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        note?: string;
    }[];
    error?: {
        code?: string;
        message?: string;
    };
    agents?: {
        fixIterations?: number;
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
        artifacts?: {
            security?: {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            };
            flow?: {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            };
            review?: {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            };
            multiPlan?: {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            };
            candidates?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }[];
            chosenCandidateId?: string;
            patchCandidate?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            };
            byNode?: Record<string, any>;
        };
        activeJobId?: string;
        parallelReview?: boolean;
        consensusImplement?: boolean;
    };
    telemetry?: {
        ts?: string;
        runId?: string;
        stepId?: string;
        jobId?: string;
        role?: string;
        chosenModel?: {
            provider?: string;
            model?: string;
        };
        attempts?: {
            model?: {
                provider?: string;
                model?: string;
            };
            ok?: boolean;
            reason?: string;
            transient?: boolean;
        }[];
        usage?: {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
        };
    }[];
}, {
    git?: {
        branch?: string;
        commitSha?: string;
    };
    runId?: string;
    sessionId?: string;
    task?: {
        goal?: string;
        context?: {
            repoName?: string;
            openFiles?: string[];
            errors?: string;
            diff?: string;
            techStack?: string[];
        };
        constraints?: {
            qualityBar?: "draft" | "normal" | "high";
            timeBudget?: string;
        };
        permissions?: {
            git?: boolean;
            readFs?: boolean;
            writeFs?: boolean;
            runCommands?: string[];
            network?: boolean;
        };
        modelPreference?: {
            provider?: string;
            model?: string;
        };
    };
    plan?: unknown;
    selectedMode?: {
        id?: string;
        name?: string;
        confidence?: number;
    };
    rollback?: {
        message?: string;
        ok?: boolean;
        ts?: string;
        runId?: string;
        kind?: "auto" | "manual";
        restoredCount?: number;
        restored?: string[];
    };
    runOutput?: unknown;
    reviewOutput?: unknown;
    flow?: {
        dryRun?: boolean;
        usePlanPrompt?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        branchName?: string;
        commitMessage?: string;
        maxFixIterations?: number;
    };
    createdAt?: string;
    updatedAt?: string;
    state?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
    pipeline?: unknown;
    bundlePath?: string;
    fixIterations?: number;
    history?: {
        ts?: string;
        from?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        to?: "INIT" | "MODE_SELECTED" | "NEEDS_PLAN" | "NEEDS_PATCH" | "NEEDS_REVIEW" | "READY_TO_APPLY" | "APPLIED_AND_VERIFIED" | "BRANCHED" | "COMMITTED" | "BUNDLED" | "DONE" | "FAILED" | "CANCELLED";
        note?: string;
    }[];
    error?: {
        code?: string;
        message?: string;
    };
    agents?: {
        fixIterations?: number;
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
        artifacts?: {
            security?: {
                issues?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "critical";
                }[];
                verdict?: "allow" | "block" | "manualConfirm";
                summary?: string;
            };
            flow?: {
                name?: string;
                version?: "1";
                nodes?: {
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    id?: string;
                    goal?: string;
                    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                    prompt?: {
                        system?: string;
                        user?: string;
                    };
                    outputKey?: string;
                    runtimePolicy?: {
                        model?: {
                            preferred?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            };
                            fallbacks?: {
                                provider?: "openai" | "anthropic" | "generic";
                                model?: string;
                            }[];
                        };
                        budget?: {
                            maxTokens?: number;
                            maxCostUsd?: number;
                        };
                        rateLimit?: {
                            rpm?: number;
                            tpm?: number;
                        };
                    };
                }[];
                edges?: {
                    kind?: "dependsOn";
                    from?: string;
                    to?: string;
                }[];
            };
            review?: {
                findings?: {
                    message?: string;
                    type?: string;
                    severity?: "high" | "low" | "medium" | "info" | "critical";
                    files?: string[];
                }[];
                verdict?: "approve" | "changes" | "reject";
                summary?: string;
            };
            multiPlan?: {
                acceptanceCriteria?: string[];
                notes?: string[];
                jobs?: {
                    status?: "pending" | "running" | "done" | "failed";
                    jobId?: string;
                    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                    goal?: string;
                    dependsOn?: string[];
                    startedAt?: string;
                    finishedAt?: string;
                }[];
            };
            candidates?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            }[];
            chosenCandidateId?: string;
            patchCandidate?: {
                patch?: string;
                commands?: {
                    cmd?: string;
                    args?: string[];
                }[];
                candidateId?: string;
                rationale?: string;
            };
            byNode?: Record<string, any>;
        };
        activeJobId?: string;
        parallelReview?: boolean;
        consensusImplement?: boolean;
    };
    telemetry?: {
        ts?: string;
        runId?: string;
        stepId?: string;
        jobId?: string;
        role?: string;
        chosenModel?: {
            provider?: string;
            model?: string;
        };
        attempts?: {
            model?: {
                provider?: string;
                model?: string;
            };
            ok?: boolean;
            reason?: string;
            transient?: boolean;
        }[];
        usage?: {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
        };
    }[];
}>;
export declare const AgentRoleSchema: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
export type AgentRole = z.infer<typeof AgentRoleSchema>;
export declare const JobStatusSchema: z.ZodEnum<["pending", "running", "done", "failed"]>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
export declare const AgentSpecSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
    modelHint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    id?: string;
    modelHint?: string;
}, {
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    id?: string;
    modelHint?: string;
}>;
export declare const JobSchema: z.ZodObject<{
    jobId: z.ZodString;
    role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
    goal: z.ZodString;
    dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
    startedAt: z.ZodOptional<z.ZodString>;
    finishedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "running" | "done" | "failed";
    jobId?: string;
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    goal?: string;
    dependsOn?: string[];
    startedAt?: string;
    finishedAt?: string;
}, {
    status?: "pending" | "running" | "done" | "failed";
    jobId?: string;
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    goal?: string;
    dependsOn?: string[];
    startedAt?: string;
    finishedAt?: string;
}>;
export declare const MultiPlanSchema: z.ZodObject<{
    jobs: z.ZodArray<z.ZodObject<{
        jobId: z.ZodString;
        role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
        goal: z.ZodString;
        dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
        startedAt: z.ZodOptional<z.ZodString>;
        finishedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }, {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }>, "many">;
    acceptanceCriteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    acceptanceCriteria?: string[];
    notes?: string[];
    jobs?: {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }[];
}, {
    acceptanceCriteria?: string[];
    notes?: string[];
    jobs?: {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }[];
}>;
export declare const PatchCandidateSchema: z.ZodObject<{
    candidateId: z.ZodString;
    patch: z.ZodString;
    commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
        cmd: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        cmd?: string;
        args?: string[];
    }, {
        cmd?: string;
        args?: string[];
    }>, "many">>;
    rationale: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patch?: string;
    commands?: {
        cmd?: string;
        args?: string[];
    }[];
    candidateId?: string;
    rationale?: string;
}, {
    patch?: string;
    commands?: {
        cmd?: string;
        args?: string[];
    }[];
    candidateId?: string;
    rationale?: string;
}>;
export declare const ApplyPayloadSchema: z.ZodObject<{
    patch: z.ZodString;
    commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
        cmd: z.ZodString;
        args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        cmd?: string;
        args?: string[];
    }, {
        cmd?: string;
        args?: string[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    patch?: string;
    commands?: {
        cmd?: string;
        args?: string[];
    }[];
}, {
    patch?: string;
    commands?: {
        cmd?: string;
        args?: string[];
    }[];
}>;
export declare const MergeDecisionSchema: z.ZodObject<{
    chosenCandidateId: z.ZodString;
    rationale: z.ZodOptional<z.ZodString>;
    requiredFixes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    rationale?: string;
    chosenCandidateId?: string;
    requiredFixes?: string[];
}, {
    rationale?: string;
    chosenCandidateId?: string;
    requiredFixes?: string[];
}>;
export declare const ReviewFindingSchema: z.ZodObject<{
    severity: z.ZodDefault<z.ZodEnum<["info", "low", "medium", "high", "critical"]>>;
    type: z.ZodString;
    message: z.ZodString;
    files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    type?: string;
    severity?: "high" | "low" | "medium" | "info" | "critical";
    files?: string[];
}, {
    message?: string;
    type?: string;
    severity?: "high" | "low" | "medium" | "info" | "critical";
    files?: string[];
}>;
export declare const ReviewReportSchema: z.ZodObject<{
    verdict: z.ZodEnum<["approve", "changes", "reject"]>;
    summary: z.ZodOptional<z.ZodString>;
    findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        severity: z.ZodDefault<z.ZodEnum<["info", "low", "medium", "high", "critical"]>>;
        type: z.ZodString;
        message: z.ZodString;
        files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "info" | "critical";
        files?: string[];
    }, {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "info" | "critical";
        files?: string[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    findings?: {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "info" | "critical";
        files?: string[];
    }[];
    verdict?: "approve" | "changes" | "reject";
    summary?: string;
}, {
    findings?: {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "info" | "critical";
        files?: string[];
    }[];
    verdict?: "approve" | "changes" | "reject";
    summary?: string;
}>;
export declare const SecurityIssueSchema: z.ZodObject<{
    type: z.ZodString;
    message: z.ZodString;
    severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    type?: string;
    severity?: "high" | "low" | "medium" | "critical";
}, {
    message?: string;
    type?: string;
    severity?: "high" | "low" | "medium" | "critical";
}>;
export declare const SecurityReportSchema: z.ZodObject<{
    verdict: z.ZodEnum<["allow", "block", "manualConfirm"]>;
    summary: z.ZodOptional<z.ZodString>;
    issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        message: z.ZodString;
        severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "critical";
    }, {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "critical";
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    issues?: {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "critical";
    }[];
    verdict?: "allow" | "block" | "manualConfirm";
    summary?: string;
}, {
    issues?: {
        message?: string;
        type?: string;
        severity?: "high" | "low" | "medium" | "critical";
    }[];
    verdict?: "allow" | "block" | "manualConfirm";
    summary?: string;
}>;
export declare const AgentsArtifactsSchema: z.ZodObject<{
    multiPlan: z.ZodOptional<z.ZodObject<{
        jobs: z.ZodArray<z.ZodObject<{
            jobId: z.ZodString;
            role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
            goal: z.ZodString;
            dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
            startedAt: z.ZodOptional<z.ZodString>;
            finishedAt: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }, {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }>, "many">;
        acceptanceCriteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        acceptanceCriteria?: string[];
        notes?: string[];
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
    }, {
        acceptanceCriteria?: string[];
        notes?: string[];
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
    }>>;
    candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        candidateId: z.ZodString;
        patch: z.ZodString;
        commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
            cmd: z.ZodString;
            args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            cmd?: string;
            args?: string[];
        }, {
            cmd?: string;
            args?: string[];
        }>, "many">>;
        rationale: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    }, {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    }>, "many">>;
    chosenCandidateId: z.ZodOptional<z.ZodString>;
    patchCandidate: z.ZodOptional<z.ZodObject<{
        candidateId: z.ZodString;
        patch: z.ZodString;
        commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
            cmd: z.ZodString;
            args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            cmd?: string;
            args?: string[];
        }, {
            cmd?: string;
            args?: string[];
        }>, "many">>;
        rationale: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    }, {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    }>>;
    review: z.ZodOptional<z.ZodObject<{
        verdict: z.ZodEnum<["approve", "changes", "reject"]>;
        summary: z.ZodOptional<z.ZodString>;
        findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
            severity: z.ZodDefault<z.ZodEnum<["info", "low", "medium", "high", "critical"]>>;
            type: z.ZodString;
            message: z.ZodString;
            files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "info" | "critical";
            files?: string[];
        }, {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "info" | "critical";
            files?: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        findings?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "info" | "critical";
            files?: string[];
        }[];
        verdict?: "approve" | "changes" | "reject";
        summary?: string;
    }, {
        findings?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "info" | "critical";
            files?: string[];
        }[];
        verdict?: "approve" | "changes" | "reject";
        summary?: string;
    }>>;
    security: z.ZodOptional<z.ZodObject<{
        verdict: z.ZodEnum<["allow", "block", "manualConfirm"]>;
        summary: z.ZodOptional<z.ZodString>;
        issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            message: z.ZodString;
            severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "critical";
        }, {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "critical";
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        issues?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "critical";
        }[];
        verdict?: "allow" | "block" | "manualConfirm";
        summary?: string;
    }, {
        issues?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "critical";
        }[];
        verdict?: "allow" | "block" | "manualConfirm";
        summary?: string;
    }>>;
    flow: z.ZodOptional<z.ZodLazy<z.ZodObject<{
        version: z.ZodDefault<z.ZodLiteral<"1">>;
        name: z.ZodOptional<z.ZodString>;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
            goal: z.ZodString;
            expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
            prompt: z.ZodObject<{
                system: z.ZodString;
                user: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                system?: string;
                user?: string;
            }, {
                system?: string;
                user?: string;
            }>;
            outputKey: z.ZodOptional<z.ZodString>;
            runtimePolicy: z.ZodOptional<z.ZodObject<{
                model: z.ZodOptional<z.ZodObject<{
                    preferred: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                        model: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }>>;
                    fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                        model: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                }, {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                }>>;
                budget: z.ZodOptional<z.ZodObject<{
                    maxTokens: z.ZodOptional<z.ZodNumber>;
                    maxCostUsd: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    maxTokens?: number;
                    maxCostUsd?: number;
                }, {
                    maxTokens?: number;
                    maxCostUsd?: number;
                }>>;
                rateLimit: z.ZodOptional<z.ZodObject<{
                    rpm: z.ZodOptional<z.ZodNumber>;
                    tpm: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    rpm?: number;
                    tpm?: number;
                }, {
                    rpm?: number;
                    tpm?: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            }, {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }, {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }>, "many">;
        edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
        }, "strip", z.ZodTypeAny, {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }, {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    }, {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    }>>>;
    byNode: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    security?: {
        issues?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "critical";
        }[];
        verdict?: "allow" | "block" | "manualConfirm";
        summary?: string;
    };
    flow?: {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    };
    review?: {
        findings?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "info" | "critical";
            files?: string[];
        }[];
        verdict?: "approve" | "changes" | "reject";
        summary?: string;
    };
    multiPlan?: {
        acceptanceCriteria?: string[];
        notes?: string[];
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
    };
    candidates?: {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    }[];
    chosenCandidateId?: string;
    patchCandidate?: {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    };
    byNode?: Record<string, any>;
}, {
    security?: {
        issues?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "critical";
        }[];
        verdict?: "allow" | "block" | "manualConfirm";
        summary?: string;
    };
    flow?: {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    };
    review?: {
        findings?: {
            message?: string;
            type?: string;
            severity?: "high" | "low" | "medium" | "info" | "critical";
            files?: string[];
        }[];
        verdict?: "approve" | "changes" | "reject";
        summary?: string;
    };
    multiPlan?: {
        acceptanceCriteria?: string[];
        notes?: string[];
        jobs?: {
            status?: "pending" | "running" | "done" | "failed";
            jobId?: string;
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            goal?: string;
            dependsOn?: string[];
            startedAt?: string;
            finishedAt?: string;
        }[];
    };
    candidates?: {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    }[];
    chosenCandidateId?: string;
    patchCandidate?: {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
        candidateId?: string;
        rationale?: string;
    };
    byNode?: Record<string, any>;
}>;
export declare const AgentsStateSchema: z.ZodObject<{
    jobs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        jobId: z.ZodString;
        role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
        goal: z.ZodString;
        dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
        startedAt: z.ZodOptional<z.ZodString>;
        finishedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }, {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }>, "many">>;
    artifacts: z.ZodDefault<z.ZodObject<{
        multiPlan: z.ZodOptional<z.ZodObject<{
            jobs: z.ZodArray<z.ZodObject<{
                jobId: z.ZodString;
                role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
                goal: z.ZodString;
                dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
                startedAt: z.ZodOptional<z.ZodString>;
                finishedAt: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }, {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }>, "many">;
            acceptanceCriteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            notes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            acceptanceCriteria?: string[];
            notes?: string[];
            jobs?: {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }[];
        }, {
            acceptanceCriteria?: string[];
            notes?: string[];
            jobs?: {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }[];
        }>>;
        candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
            candidateId: z.ZodString;
            patch: z.ZodString;
            commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
                cmd: z.ZodString;
                args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                cmd?: string;
                args?: string[];
            }, {
                cmd?: string;
                args?: string[];
            }>, "many">>;
            rationale: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }, {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }>, "many">>;
        chosenCandidateId: z.ZodOptional<z.ZodString>;
        patchCandidate: z.ZodOptional<z.ZodObject<{
            candidateId: z.ZodString;
            patch: z.ZodString;
            commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
                cmd: z.ZodString;
                args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                cmd?: string;
                args?: string[];
            }, {
                cmd?: string;
                args?: string[];
            }>, "many">>;
            rationale: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }, {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }>>;
        review: z.ZodOptional<z.ZodObject<{
            verdict: z.ZodEnum<["approve", "changes", "reject"]>;
            summary: z.ZodOptional<z.ZodString>;
            findings: z.ZodDefault<z.ZodArray<z.ZodObject<{
                severity: z.ZodDefault<z.ZodEnum<["info", "low", "medium", "high", "critical"]>>;
                type: z.ZodString;
                message: z.ZodString;
                files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }, {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            findings?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }[];
            verdict?: "approve" | "changes" | "reject";
            summary?: string;
        }, {
            findings?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }[];
            verdict?: "approve" | "changes" | "reject";
            summary?: string;
        }>>;
        security: z.ZodOptional<z.ZodObject<{
            verdict: z.ZodEnum<["allow", "block", "manualConfirm"]>;
            summary: z.ZodOptional<z.ZodString>;
            issues: z.ZodDefault<z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                message: z.ZodString;
                severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
            }, "strip", z.ZodTypeAny, {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }, {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            issues?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }[];
            verdict?: "allow" | "block" | "manualConfirm";
            summary?: string;
        }, {
            issues?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }[];
            verdict?: "allow" | "block" | "manualConfirm";
            summary?: string;
        }>>;
        flow: z.ZodOptional<z.ZodLazy<z.ZodObject<{
            version: z.ZodDefault<z.ZodLiteral<"1">>;
            name: z.ZodOptional<z.ZodString>;
            nodes: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
                goal: z.ZodString;
                expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
                prompt: z.ZodObject<{
                    system: z.ZodString;
                    user: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    system?: string;
                    user?: string;
                }, {
                    system?: string;
                    user?: string;
                }>;
                outputKey: z.ZodOptional<z.ZodString>;
                runtimePolicy: z.ZodOptional<z.ZodObject<{
                    model: z.ZodOptional<z.ZodObject<{
                        preferred: z.ZodOptional<z.ZodObject<{
                            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                            model: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }>>;
                        fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                            model: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }, {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }>, "many">>;
                    }, "strip", z.ZodTypeAny, {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    }, {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    }>>;
                    budget: z.ZodOptional<z.ZodObject<{
                        maxTokens: z.ZodOptional<z.ZodNumber>;
                        maxCostUsd: z.ZodOptional<z.ZodNumber>;
                    }, "strip", z.ZodTypeAny, {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    }, {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    }>>;
                    rateLimit: z.ZodOptional<z.ZodObject<{
                        rpm: z.ZodOptional<z.ZodNumber>;
                        tpm: z.ZodOptional<z.ZodNumber>;
                    }, "strip", z.ZodTypeAny, {
                        rpm?: number;
                        tpm?: number;
                    }, {
                        rpm?: number;
                        tpm?: number;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                }, {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }, {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }>, "many">;
            edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
                from: z.ZodString;
                to: z.ZodString;
                kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
            }, "strip", z.ZodTypeAny, {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }, {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        }, {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        }>>>;
        byNode: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        security?: {
            issues?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }[];
            verdict?: "allow" | "block" | "manualConfirm";
            summary?: string;
        };
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        review?: {
            findings?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }[];
            verdict?: "approve" | "changes" | "reject";
            summary?: string;
        };
        multiPlan?: {
            acceptanceCriteria?: string[];
            notes?: string[];
            jobs?: {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }[];
        };
        candidates?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }[];
        chosenCandidateId?: string;
        patchCandidate?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        };
        byNode?: Record<string, any>;
    }, {
        security?: {
            issues?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }[];
            verdict?: "allow" | "block" | "manualConfirm";
            summary?: string;
        };
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        review?: {
            findings?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }[];
            verdict?: "approve" | "changes" | "reject";
            summary?: string;
        };
        multiPlan?: {
            acceptanceCriteria?: string[];
            notes?: string[];
            jobs?: {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }[];
        };
        candidates?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }[];
        chosenCandidateId?: string;
        patchCandidate?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        };
        byNode?: Record<string, any>;
    }>>;
    activeJobId: z.ZodOptional<z.ZodString>;
    fixIterations: z.ZodDefault<z.ZodNumber>;
    parallelReview: z.ZodDefault<z.ZodBoolean>;
    consensusImplement: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    fixIterations?: number;
    jobs?: {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }[];
    artifacts?: {
        security?: {
            issues?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }[];
            verdict?: "allow" | "block" | "manualConfirm";
            summary?: string;
        };
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        review?: {
            findings?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }[];
            verdict?: "approve" | "changes" | "reject";
            summary?: string;
        };
        multiPlan?: {
            acceptanceCriteria?: string[];
            notes?: string[];
            jobs?: {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }[];
        };
        candidates?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }[];
        chosenCandidateId?: string;
        patchCandidate?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        };
        byNode?: Record<string, any>;
    };
    activeJobId?: string;
    parallelReview?: boolean;
    consensusImplement?: boolean;
}, {
    fixIterations?: number;
    jobs?: {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }[];
    artifacts?: {
        security?: {
            issues?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "critical";
            }[];
            verdict?: "allow" | "block" | "manualConfirm";
            summary?: string;
        };
        flow?: {
            name?: string;
            version?: "1";
            nodes?: {
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                id?: string;
                goal?: string;
                expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
                prompt?: {
                    system?: string;
                    user?: string;
                };
                outputKey?: string;
                runtimePolicy?: {
                    model?: {
                        preferred?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        };
                        fallbacks?: {
                            provider?: "openai" | "anthropic" | "generic";
                            model?: string;
                        }[];
                    };
                    budget?: {
                        maxTokens?: number;
                        maxCostUsd?: number;
                    };
                    rateLimit?: {
                        rpm?: number;
                        tpm?: number;
                    };
                };
            }[];
            edges?: {
                kind?: "dependsOn";
                from?: string;
                to?: string;
            }[];
        };
        review?: {
            findings?: {
                message?: string;
                type?: string;
                severity?: "high" | "low" | "medium" | "info" | "critical";
                files?: string[];
            }[];
            verdict?: "approve" | "changes" | "reject";
            summary?: string;
        };
        multiPlan?: {
            acceptanceCriteria?: string[];
            notes?: string[];
            jobs?: {
                status?: "pending" | "running" | "done" | "failed";
                jobId?: string;
                role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
                goal?: string;
                dependsOn?: string[];
                startedAt?: string;
                finishedAt?: string;
            }[];
        };
        candidates?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        }[];
        chosenCandidateId?: string;
        patchCandidate?: {
            patch?: string;
            commands?: {
                cmd?: string;
                args?: string[];
            }[];
            candidateId?: string;
            rationale?: string;
        };
        byNode?: Record<string, any>;
    };
    activeJobId?: string;
    parallelReview?: boolean;
    consensusImplement?: boolean;
}>;
export declare const AgentRuntimePolicySchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodObject<{
        preferred: z.ZodOptional<z.ZodObject<{
            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
            model: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }>>;
        fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
            model: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }, {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    }, {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    }>>;
    budget: z.ZodOptional<z.ZodObject<{
        maxTokens: z.ZodOptional<z.ZodNumber>;
        maxCostUsd: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxTokens?: number;
        maxCostUsd?: number;
    }, {
        maxTokens?: number;
        maxCostUsd?: number;
    }>>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        rpm: z.ZodOptional<z.ZodNumber>;
        tpm: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        rpm?: number;
        tpm?: number;
    }, {
        rpm?: number;
        tpm?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    model?: {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    };
    budget?: {
        maxTokens?: number;
        maxCostUsd?: number;
    };
    rateLimit?: {
        rpm?: number;
        tpm?: number;
    };
}, {
    model?: {
        preferred?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        };
        fallbacks?: {
            provider?: "openai" | "anthropic" | "generic";
            model?: string;
        }[];
    };
    budget?: {
        maxTokens?: number;
        maxCostUsd?: number;
    };
    rateLimit?: {
        rpm?: number;
        tpm?: number;
    };
}>;
export declare const FlowNodeSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
    goal: z.ZodString;
    expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
    prompt: z.ZodObject<{
        system: z.ZodString;
        user: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        system?: string;
        user?: string;
    }, {
        system?: string;
        user?: string;
    }>;
    outputKey: z.ZodOptional<z.ZodString>;
    runtimePolicy: z.ZodOptional<z.ZodObject<{
        model: z.ZodOptional<z.ZodObject<{
            preferred: z.ZodOptional<z.ZodObject<{
                provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                model: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }>>;
            fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                model: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        }, {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        }>>;
        budget: z.ZodOptional<z.ZodObject<{
            maxTokens: z.ZodOptional<z.ZodNumber>;
            maxCostUsd: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxTokens?: number;
            maxCostUsd?: number;
        }, {
            maxTokens?: number;
            maxCostUsd?: number;
        }>>;
        rateLimit: z.ZodOptional<z.ZodObject<{
            rpm: z.ZodOptional<z.ZodNumber>;
            tpm: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            rpm?: number;
            tpm?: number;
        }, {
            rpm?: number;
            tpm?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    }, {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    id?: string;
    goal?: string;
    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
    prompt?: {
        system?: string;
        user?: string;
    };
    outputKey?: string;
    runtimePolicy?: {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    };
}, {
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    id?: string;
    goal?: string;
    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
    prompt?: {
        system?: string;
        user?: string;
    };
    outputKey?: string;
    runtimePolicy?: {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    };
}>;
export declare const FlowEdgeSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
    kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
}, "strip", z.ZodTypeAny, {
    kind?: "dependsOn";
    from?: string;
    to?: string;
}, {
    kind?: "dependsOn";
    from?: string;
    to?: string;
}>;
export declare const FlowSpecSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodLiteral<"1">>;
    name: z.ZodOptional<z.ZodString>;
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
        goal: z.ZodString;
        expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
        prompt: z.ZodObject<{
            system: z.ZodString;
            user: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            system?: string;
            user?: string;
        }, {
            system?: string;
            user?: string;
        }>;
        outputKey: z.ZodOptional<z.ZodString>;
        runtimePolicy: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodObject<{
                preferred: z.ZodOptional<z.ZodObject<{
                    provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                    model: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }, {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }>>;
                fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                    model: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }, {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            }, {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            }>>;
            budget: z.ZodOptional<z.ZodObject<{
                maxTokens: z.ZodOptional<z.ZodNumber>;
                maxCostUsd: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                maxTokens?: number;
                maxCostUsd?: number;
            }, {
                maxTokens?: number;
                maxCostUsd?: number;
            }>>;
            rateLimit: z.ZodOptional<z.ZodObject<{
                rpm: z.ZodOptional<z.ZodNumber>;
                tpm: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                rpm?: number;
                tpm?: number;
            }, {
                rpm?: number;
                tpm?: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            model?: {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            };
            budget?: {
                maxTokens?: number;
                maxCostUsd?: number;
            };
            rateLimit?: {
                rpm?: number;
                tpm?: number;
            };
        }, {
            model?: {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            };
            budget?: {
                maxTokens?: number;
                maxCostUsd?: number;
            };
            rateLimit?: {
                rpm?: number;
                tpm?: number;
            };
        }>>;
    }, "strip", z.ZodTypeAny, {
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        id?: string;
        goal?: string;
        expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
        prompt?: {
            system?: string;
            user?: string;
        };
        outputKey?: string;
        runtimePolicy?: {
            model?: {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            };
            budget?: {
                maxTokens?: number;
                maxCostUsd?: number;
            };
            rateLimit?: {
                rpm?: number;
                tpm?: number;
            };
        };
    }, {
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        id?: string;
        goal?: string;
        expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
        prompt?: {
            system?: string;
            user?: string;
        };
        outputKey?: string;
        runtimePolicy?: {
            model?: {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            };
            budget?: {
                maxTokens?: number;
                maxCostUsd?: number;
            };
            rateLimit?: {
                rpm?: number;
                tpm?: number;
            };
        };
    }>, "many">;
    edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
        kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
    }, "strip", z.ZodTypeAny, {
        kind?: "dependsOn";
        from?: string;
        to?: string;
    }, {
        kind?: "dependsOn";
        from?: string;
        to?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    version?: "1";
    nodes?: {
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        id?: string;
        goal?: string;
        expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
        prompt?: {
            system?: string;
            user?: string;
        };
        outputKey?: string;
        runtimePolicy?: {
            model?: {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            };
            budget?: {
                maxTokens?: number;
                maxCostUsd?: number;
            };
            rateLimit?: {
                rpm?: number;
                tpm?: number;
            };
        };
    }[];
    edges?: {
        kind?: "dependsOn";
        from?: string;
        to?: string;
    }[];
}, {
    name?: string;
    version?: "1";
    nodes?: {
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        id?: string;
        goal?: string;
        expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
        prompt?: {
            system?: string;
            user?: string;
        };
        outputKey?: string;
        runtimePolicy?: {
            model?: {
                preferred?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                };
                fallbacks?: {
                    provider?: "openai" | "anthropic" | "generic";
                    model?: string;
                }[];
            };
            budget?: {
                maxTokens?: number;
                maxCostUsd?: number;
            };
            rateLimit?: {
                rpm?: number;
                tpm?: number;
            };
        };
    }[];
    edges?: {
        kind?: "dependsOn";
        from?: string;
        to?: string;
    }[];
}>;
export declare const AgentsPlanInputSchema: z.ZodObject<{
    task: z.ZodObject<{
        goal: z.ZodString;
        context: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        goal?: string;
        context?: any;
    }, {
        goal?: string;
        context?: any;
    }>;
    flow: z.ZodDefault<z.ZodObject<{
        autoApply: z.ZodDefault<z.ZodBoolean>;
        useReview: z.ZodDefault<z.ZodBoolean>;
        useSecurity: z.ZodDefault<z.ZodBoolean>;
        createBranch: z.ZodDefault<z.ZodBoolean>;
        autoCommit: z.ZodDefault<z.ZodBoolean>;
        dryRun: z.ZodDefault<z.ZodBoolean>;
        maxFixIterations: z.ZodDefault<z.ZodNumber>;
        parallelReview: z.ZodOptional<z.ZodBoolean>;
        consensusImplement: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dryRun?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        maxFixIterations?: number;
        parallelReview?: boolean;
        consensusImplement?: boolean;
        useSecurity?: boolean;
    }, {
        dryRun?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        maxFixIterations?: number;
        parallelReview?: boolean;
        consensusImplement?: boolean;
        useSecurity?: boolean;
    }>>;
    dsl: z.ZodOptional<z.ZodObject<{
        version: z.ZodDefault<z.ZodLiteral<"1">>;
        name: z.ZodOptional<z.ZodString>;
        nodes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
            goal: z.ZodString;
            expectedSchema: z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>;
            prompt: z.ZodObject<{
                system: z.ZodString;
                user: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                system?: string;
                user?: string;
            }, {
                system?: string;
                user?: string;
            }>;
            outputKey: z.ZodOptional<z.ZodString>;
            runtimePolicy: z.ZodOptional<z.ZodObject<{
                model: z.ZodOptional<z.ZodObject<{
                    preferred: z.ZodOptional<z.ZodObject<{
                        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                        model: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }>>;
                    fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                        model: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }, {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }>, "many">>;
                }, "strip", z.ZodTypeAny, {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                }, {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                }>>;
                budget: z.ZodOptional<z.ZodObject<{
                    maxTokens: z.ZodOptional<z.ZodNumber>;
                    maxCostUsd: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    maxTokens?: number;
                    maxCostUsd?: number;
                }, {
                    maxTokens?: number;
                    maxCostUsd?: number;
                }>>;
                rateLimit: z.ZodOptional<z.ZodObject<{
                    rpm: z.ZodOptional<z.ZodNumber>;
                    tpm: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    rpm?: number;
                    tpm?: number;
                }, {
                    rpm?: number;
                    tpm?: number;
                }>>;
            }, "strip", z.ZodTypeAny, {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            }, {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }, {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }>, "many">;
        edges: z.ZodDefault<z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
            kind: z.ZodDefault<z.ZodLiteral<"dependsOn">>;
        }, "strip", z.ZodTypeAny, {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }, {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    }, {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    }>>;
    modeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    task?: {
        goal?: string;
        context?: any;
    };
    modeId?: string;
    flow?: {
        dryRun?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        maxFixIterations?: number;
        parallelReview?: boolean;
        consensusImplement?: boolean;
        useSecurity?: boolean;
    };
    dsl?: {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    };
}, {
    task?: {
        goal?: string;
        context?: any;
    };
    modeId?: string;
    flow?: {
        dryRun?: boolean;
        useReview?: boolean;
        autoApply?: boolean;
        autoCommit?: boolean;
        createBranch?: boolean;
        maxFixIterations?: number;
        parallelReview?: boolean;
        consensusImplement?: boolean;
        useSecurity?: boolean;
    };
    dsl?: {
        name?: string;
        version?: "1";
        nodes?: {
            role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
            id?: string;
            goal?: string;
            expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
            prompt?: {
                system?: string;
                user?: string;
            };
            outputKey?: string;
            runtimePolicy?: {
                model?: {
                    preferred?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    };
                    fallbacks?: {
                        provider?: "openai" | "anthropic" | "generic";
                        model?: string;
                    }[];
                };
                budget?: {
                    maxTokens?: number;
                    maxCostUsd?: number;
                };
                rateLimit?: {
                    rpm?: number;
                    tpm?: number;
                };
            };
        }[];
        edges?: {
            kind?: "dependsOn";
            from?: string;
            to?: string;
        }[];
    };
}>;
export declare const AgentsNextInputSchema: z.ZodObject<{
    runId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runId?: string;
}, {
    runId?: string;
}>;
export declare const AgentsSubmitInputSchema: z.ZodObject<{
    runId: z.ZodString;
    jobId: z.ZodString;
    role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
    payload: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    runId?: string;
    jobId?: string;
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    payload?: any;
}, {
    runId?: string;
    jobId?: string;
    role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
    payload?: any;
}>;
export declare const AgentsMergeDecisionInputSchema: z.ZodObject<{
    runId: z.ZodString;
    decision: z.ZodObject<{
        chosenCandidateId: z.ZodString;
        rationale: z.ZodOptional<z.ZodString>;
        requiredFixes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        rationale?: string;
        chosenCandidateId?: string;
        requiredFixes?: string[];
    }, {
        rationale?: string;
        chosenCandidateId?: string;
        requiredFixes?: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    runId?: string;
    decision?: {
        rationale?: string;
        chosenCandidateId?: string;
        requiredFixes?: string[];
    };
}, {
    runId?: string;
    decision?: {
        rationale?: string;
        chosenCandidateId?: string;
        requiredFixes?: string[];
    };
}>;
export declare const AgentsMergeDecisionResultSchema: z.ZodObject<{
    runId: z.ZodString;
    ok: z.ZodBoolean;
    status: z.ZodDefault<z.ZodEnum<["running", "manual", "done", "failed"]>>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    status?: "manual" | "running" | "done" | "failed";
    ok?: boolean;
    runId?: string;
}, {
    message?: string;
    status?: "manual" | "running" | "done" | "failed";
    ok?: boolean;
    runId?: string;
}>;
export declare const AgentsNextResultSchema: z.ZodObject<{
    runId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    job: z.ZodNullable<z.ZodObject<{
        jobId: z.ZodString;
        role: z.ZodEnum<["planner", "implementer", "reviewer", "security", "arbiter"]>;
        goal: z.ZodString;
        dependsOn: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodDefault<z.ZodEnum<["pending", "running", "done", "failed"]>>;
        startedAt: z.ZodOptional<z.ZodString>;
        finishedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }, {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    }>>;
    expectedSchema: z.ZodNullable<z.ZodEnum<["multiPlan", "patchCandidate", "reviewReport", "securityReport", "mergeDecision"]>>;
    promptPack: z.ZodNullable<z.ZodObject<{
        system: z.ZodString;
        user: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        system?: string;
        user?: string;
    }, {
        system?: string;
        user?: string;
    }>>;
    applyPayload: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        patch: z.ZodString;
        commands: z.ZodDefault<z.ZodArray<z.ZodObject<{
            cmd: z.ZodString;
            args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            cmd?: string;
            args?: string[];
        }, {
            cmd?: string;
            args?: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
    }, {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
    }>>>;
    nodeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    runtimePolicy: z.ZodOptional<z.ZodObject<{
        model: z.ZodOptional<z.ZodObject<{
            preferred: z.ZodOptional<z.ZodObject<{
                provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                model: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }>>;
            fallbacks: z.ZodOptional<z.ZodArray<z.ZodObject<{
                provider: z.ZodEnum<["openai", "anthropic", "generic"]>;
                model: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }, {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        }, {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        }>>;
        budget: z.ZodOptional<z.ZodObject<{
            maxTokens: z.ZodOptional<z.ZodNumber>;
            maxCostUsd: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxTokens?: number;
            maxCostUsd?: number;
        }, {
            maxTokens?: number;
            maxCostUsd?: number;
        }>>;
        rateLimit: z.ZodOptional<z.ZodObject<{
            rpm: z.ZodOptional<z.ZodNumber>;
            tpm: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            rpm?: number;
            tpm?: number;
        }, {
            rpm?: number;
            tpm?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    }, {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    }>>;
    status: z.ZodDefault<z.ZodEnum<["running", "manual", "done", "failed"]>>;
    message: z.ZodOptional<z.ZodString>;
    suggestedTools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    status?: "manual" | "running" | "done" | "failed";
    runId?: string;
    sessionId?: string;
    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
    runtimePolicy?: {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    };
    job?: {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    };
    promptPack?: {
        system?: string;
        user?: string;
    };
    applyPayload?: {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
    };
    nodeId?: string;
    suggestedTools?: string[];
}, {
    message?: string;
    status?: "manual" | "running" | "done" | "failed";
    runId?: string;
    sessionId?: string;
    expectedSchema?: "multiPlan" | "patchCandidate" | "reviewReport" | "securityReport" | "mergeDecision";
    runtimePolicy?: {
        model?: {
            preferred?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            };
            fallbacks?: {
                provider?: "openai" | "anthropic" | "generic";
                model?: string;
            }[];
        };
        budget?: {
            maxTokens?: number;
            maxCostUsd?: number;
        };
        rateLimit?: {
            rpm?: number;
            tpm?: number;
        };
    };
    job?: {
        status?: "pending" | "running" | "done" | "failed";
        jobId?: string;
        role?: "security" | "planner" | "implementer" | "reviewer" | "arbiter";
        goal?: string;
        dependsOn?: string[];
        startedAt?: string;
        finishedAt?: string;
    };
    promptPack?: {
        system?: string;
        user?: string;
    };
    applyPayload?: {
        patch?: string;
        commands?: {
            cmd?: string;
            args?: string[];
        }[];
    };
    nodeId?: string;
    suggestedTools?: string[];
}>;
export declare const AgentsSubmitResultSchema: z.ZodObject<{
    runId: z.ZodString;
    jobId: z.ZodString;
    ok: z.ZodBoolean;
    status: z.ZodDefault<z.ZodEnum<["running", "manual", "done", "failed"]>>;
    message: z.ZodOptional<z.ZodString>;
    suggestedTools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    message?: string;
    status?: "manual" | "running" | "done" | "failed";
    ok?: boolean;
    runId?: string;
    jobId?: string;
    suggestedTools?: string[];
}, {
    message?: string;
    status?: "manual" | "running" | "done" | "failed";
    ok?: boolean;
    runId?: string;
    jobId?: string;
    suggestedTools?: string[];
}>;
