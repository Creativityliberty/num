export type PatchStats = {
  valid: boolean;
  filesChanged: number;
  insertions: number;
  deletions: number;
  files: string[];
  errors: string[];
};

const DIFF_HEADER_RE = /^diff --git a\/(.+?) b\/(.+?)$/gm;
const HUNK_HEADER_RE = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/gm;
const ADD_LINE_RE = /^\+(?!\+\+)/gm;
const DEL_LINE_RE = /^-(?!--)/gm;

export function parsePatchStats(diff: string): PatchStats {
  const errors: string[] = [];

  if (!diff.trim()) {
    return { valid: false, filesChanged: 0, insertions: 0, deletions: 0, files: [], errors: ["Empty diff"] };
  }

  // Check for valid diff format
  const hasGitHeader = diff.includes("diff --git");
  const hasHunks = HUNK_HEADER_RE.test(diff);

  if (!hasGitHeader) {
    errors.push("Missing 'diff --git' header — not a valid unified diff");
  }
  if (!hasHunks) {
    errors.push("Missing hunk headers (@@ ... @@)");
  }

  // Extract files
  const files: string[] = [];
  let match: RegExpExecArray | null;
  const headerRe = new RegExp(DIFF_HEADER_RE.source, "gm");
  while ((match = headerRe.exec(diff)) !== null) {
    const file = match[2];
    if (file && !files.includes(file)) {
      files.push(file);
    }
  }

  // Count insertions/deletions
  const insertions = (diff.match(ADD_LINE_RE) ?? []).length;
  const deletions = (diff.match(DEL_LINE_RE) ?? []).length;

  return {
    valid: errors.length === 0,
    filesChanged: files.length,
    insertions,
    deletions,
    files,
    errors,
  };
}

export function validatePatchSafety(
  diff: string,
  workspaceRoot: string,
  opts: { maxBytes?: number; maxFiles?: number } = {}
): { safe: boolean; errors: string[] } {
  const errors: string[] = [];
  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024; // 2MB
  const maxFiles = opts.maxFiles ?? 200;

  if (Buffer.byteLength(diff, "utf8") > maxBytes) {
    errors.push(`Patch exceeds max size (${maxBytes} bytes)`);
  }

  const stats = parsePatchStats(diff);

  if (stats.filesChanged > maxFiles) {
    errors.push(`Patch touches too many files (${stats.filesChanged} > ${maxFiles})`);
  }

  // Check for path traversal
  for (const file of stats.files) {
    if (file.startsWith("/") || file.includes("..")) {
      errors.push(`Unsafe path detected: ${file}`);
    }
  }

  return { safe: errors.length === 0, errors };
}
