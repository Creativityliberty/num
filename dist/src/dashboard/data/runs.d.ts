export declare function hasBackup(workspaceRoot: string, runId: string): Promise<boolean>;
export declare function saveRun(workspaceRoot: string, run: unknown): Promise<{
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
export declare function listRuns(workspaceRoot: string): Promise<{
    runId: string;
    sessionId: string;
    state: string;
    modeId: string | null;
    updatedAt: string;
    createdAt: string;
}[]>;
export declare function loadRun(workspaceRoot: string, runId: string): Promise<{
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
export declare function exportRunJSON(workspaceRoot: string, runId: string): Promise<{
    run: {
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
    };
    bundle: unknown;
}>;
export declare function listBundlesForSession(workspaceRoot: string, sessionId: string): Promise<string[]>;
export declare function loadBundleForSession(workspaceRoot: string, sessionId: string): Promise<unknown>;
export declare function importRunJSON(workspaceRoot: string, runJson: unknown): Promise<{
    ok: boolean;
    runId: string;
    path: string;
}>;
