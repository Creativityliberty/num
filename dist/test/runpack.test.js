import { describe, expect, it } from "vitest";
import { buildReviewPrompt, buildRunPrompt } from "../src/core/runpack.js";
const mockMode = {
    id: "test-mode",
    name: "Test Mode",
    description: "A test mode",
    tags: ["test"],
    prompts: {
        system: "You are a test assistant.",
        developer: "Follow best practices.",
    },
    source: { path: "test.yaml", raw: {} },
};
const mockTask = {
    goal: "Fix the authentication bug",
    context: {
        repoName: "my-app",
        techStack: ["node", "typescript"],
        openFiles: ["src/auth.ts"],
        errors: "TypeError: Cannot read property 'token' of undefined",
    },
};
describe("buildRunPrompt", () => {
    it("includes implementation mode instructions", () => {
        const pack = buildRunPrompt(mockMode, mockTask);
        expect(pack.system).toContain("test assistant");
        expect(pack.developer).toContain("IMPLEMENTATION MODE");
        expect(pack.developer).toContain("unified diff");
        expect(pack.developer).toContain("patch");
        expect(pack.developer).toContain("commands");
        expect(pack.developer).toContain("pr");
    });
    it("includes task context in developer prompt", () => {
        const pack = buildRunPrompt(mockMode, mockTask);
        expect(pack.developer).toContain("Fix the authentication bug");
        expect(pack.developer).toContain("my-app");
        expect(pack.developer).toContain("node");
        expect(pack.developer).toContain("src/auth.ts");
        expect(pack.developer).toContain("TypeError");
    });
    it("includes output contract", () => {
        const pack = buildRunPrompt(mockMode, mockTask);
        expect(pack.outputContract).toContain("patch");
        expect(pack.outputContract).toContain("commands");
        expect(pack.outputContract).toContain("pr");
        expect(pack.outputContract).toContain("notes");
    });
    it("uses mode name in system prompt when no system defined", () => {
        const modeNoSystem = {
            ...mockMode,
            prompts: { developer: "Some instructions" },
        };
        const pack = buildRunPrompt(modeNoSystem, mockTask);
        expect(pack.system).toContain("Test Mode");
    });
});
describe("buildReviewPrompt", () => {
    const mockPatch = `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,7 @@
 function getToken() {
+  if (!user) return null;
   return user.token;
 }`;
    it("includes review mode instructions", () => {
        const pack = buildReviewPrompt(mockMode, mockPatch);
        expect(pack.system).toContain("senior code reviewer");
        expect(pack.developer).toContain("REVIEW MODE");
        expect(pack.developer).toContain("severity");
        expect(pack.developer).toContain("findings");
        expect(pack.developer).toContain("approval");
    });
    it("includes the patch to review", () => {
        const pack = buildReviewPrompt(mockMode, mockPatch);
        expect(pack.patchToReview).toBe(mockPatch);
        expect(pack.developer).toContain("diff --git");
        expect(pack.developer).toContain("src/auth.ts");
    });
    it("includes output contract", () => {
        const pack = buildReviewPrompt(mockMode, mockPatch);
        expect(pack.outputContract).toContain("severity");
        expect(pack.outputContract).toContain("low|medium|high|blocker");
        expect(pack.outputContract).toContain("findings");
        expect(pack.outputContract).toContain("approval");
    });
});
//# sourceMappingURL=runpack.test.js.map