import { describe, expect, it } from "vitest";
import { parsePatchStats, validatePatchSafety } from "../src/core/patch.js";
describe("parsePatchStats", () => {
    it("parses a valid unified diff", () => {
        const diff = `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,7 @@
 function getToken() {
+  if (!user) return null;
   return user.token;
 }`;
        const stats = parsePatchStats(diff);
        expect(stats.valid).toBe(true);
        expect(stats.filesChanged).toBe(1);
        expect(stats.files).toContain("src/auth.ts");
        expect(stats.insertions).toBeGreaterThan(0);
        expect(stats.errors).toHaveLength(0);
    });
    it("detects invalid diff without git header", () => {
        const diff = `--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,7 @@
+  if (!user) return null;`;
        const stats = parsePatchStats(diff);
        expect(stats.valid).toBe(false);
        expect(stats.errors.some((e) => e.includes("diff --git"))).toBe(true);
    });
    it("detects empty diff", () => {
        const stats = parsePatchStats("");
        expect(stats.valid).toBe(false);
        expect(stats.errors.some((e) => e.includes("Empty"))).toBe(true);
    });
    it("counts multiple files", () => {
        const diff = `diff --git a/src/a.ts b/src/a.ts
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,1 +1,2 @@
+line
diff --git a/src/b.ts b/src/b.ts
--- a/src/b.ts
+++ b/src/b.ts
@@ -1,1 +1,2 @@
+another line`;
        const stats = parsePatchStats(diff);
        expect(stats.filesChanged).toBe(2);
        expect(stats.files).toContain("src/a.ts");
        expect(stats.files).toContain("src/b.ts");
    });
    it("counts insertions and deletions", () => {
        const diff = `diff --git a/src/file.ts b/src/file.ts
--- a/src/file.ts
+++ b/src/file.ts
@@ -1,3 +1,3 @@
-old line 1
-old line 2
+new line 1
+new line 2
+new line 3`;
        const stats = parsePatchStats(diff);
        expect(stats.insertions).toBe(3);
        expect(stats.deletions).toBe(2);
    });
});
describe("validatePatchSafety", () => {
    const validDiff = `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,6 +10,7 @@
+  if (!user) return null;`;
    it("accepts valid patch within limits", () => {
        const result = validatePatchSafety(validDiff, "/workspace");
        expect(result.safe).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
    it("rejects patch exceeding max size", () => {
        const largeDiff = validDiff + "x".repeat(3 * 1024 * 1024);
        const result = validatePatchSafety(largeDiff, "/workspace", { maxBytes: 2 * 1024 * 1024 });
        expect(result.safe).toBe(false);
        expect(result.errors.some((e) => e.includes("max size"))).toBe(true);
    });
    it("rejects patch with path traversal", () => {
        const evilDiff = `diff --git a/../../../etc/passwd b/../../../etc/passwd
--- a/../../../etc/passwd
+++ b/../../../etc/passwd
@@ -1,1 +1,2 @@
+hacked`;
        const result = validatePatchSafety(evilDiff, "/workspace");
        expect(result.safe).toBe(false);
        expect(result.errors.some((e) => e.includes("Unsafe path"))).toBe(true);
    });
    it("rejects patch with absolute paths", () => {
        const evilDiff = `diff --git a//etc/passwd b//etc/passwd
--- a//etc/passwd
+++ b//etc/passwd
@@ -1,1 +1,2 @@
+hacked`;
        const result = validatePatchSafety(evilDiff, "/workspace");
        expect(result.safe).toBe(false);
        expect(result.errors.some((e) => e.includes("Unsafe path"))).toBe(true);
    });
});
//# sourceMappingURL=patch.test.js.map