import fs from "node:fs";
import path from "node:path";

export type CustomMode = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  tags: string[];
  capabilities: string[];
  isChef: boolean;
  isStub: boolean;
  roleDefinition?: string;
  whenToUse?: string;
  groups?: string[];
  source: "custom-yaml";
};

export function loadCustomModes(customModesDir: string): CustomMode[] {
  const modes: CustomMode[] = [];

  if (!fs.existsSync(customModesDir)) {
    return modes;
  }

  const files = fs.readdirSync(customModesDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(customModesDir, file), "utf-8");
      const parsed = parseYamlModes(content);
      modes.push(...parsed);
    } catch (e) {
      // Ignore parse errors
    }
  }

  return modes;
}

function parseYamlModes(content: string): CustomMode[] {
  const modes: CustomMode[] = [];

  // Check if content has customModes section
  if (!content.includes("customModes:")) {
    return modes;
  }

  // Split by mode entries (each starts with "  - slug:")
  const modeBlocks = content.split(/\n\s*-\s+slug:/);

  for (let i = 1; i < modeBlocks.length; i++) {
    const block = "slug:" + modeBlocks[i];
    const mode = parseModBlock(block);
    if (mode) {
      modes.push(mode);
    }
  }

  return modes;
}

function parseModBlock(block: string): CustomMode | null {
  const slug = extractValue(block, "slug");
  if (!slug) return null;

  const name = extractValue(block, "name") || slug;
  const description = extractValue(block, "description");
  const roleDefinition = extractMultilineValue(block, "roleDefinition");
  const whenToUse = extractMultilineValue(block, "whenToUse");

  // Extract groups
  const groupsMatch = block.match(/groups:\s*\n((?:\s+-\s+\w+\s*\n?)+)/);
  const groups: string[] = [];
  if (groupsMatch) {
    const groupLines = groupsMatch[1]?.match(/-\s+(\w+)/g);
    if (groupLines) {
      for (const g of groupLines) {
        const m = g.match(/-\s+(\w+)/);
        if (m && m[1]) groups.push(m[1]);
      }
    }
  }

  // Determine capabilities from groups
  const capabilities: string[] = [];
  if (groups.includes("read")) capabilities.push("read");
  if (groups.includes("edit")) capabilities.push("edit");
  if (groups.includes("browser")) capabilities.push("browser");
  if (groups.includes("command")) capabilities.push("command");
  if (groups.includes("mcp")) capabilities.push("mcp");

  // Determine tags
  const tags: string[] = [...groups];

  // Check if chef (has specific keywords)
  const isChef = name.toLowerCase().includes("orchestrator") ||
                 name.toLowerCase().includes("sparc") ||
                 slug.includes("orchestrator") ||
                 slug.includes("coordinator");

  return {
    id: `custom:${slug}`,
    slug,
    name,
    description,
    tags,
    capabilities,
    isChef,
    isStub: false,
    roleDefinition,
    whenToUse,
    groups,
    source: "custom-yaml",
  };
}

function extractValue(block: string, key: string): string | undefined {
  const regex = new RegExp(`${key}:\\s*(.+?)(?:\\n|$)`);
  const match = block.match(regex);
  if (match && match[1]) {
    let value = match[1].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return undefined;
}

function extractMultilineValue(block: string, key: string): string | undefined {
  const regex = new RegExp(`${key}:\\s*\\|\\s*\\n([\\s\\S]*?)(?=\\n\\s*\\w+:|$)`);
  const match = block.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Try single line
  return extractValue(block, key);
}

export function getCustomModesStats(modes: CustomMode[]): Record<string, unknown> {
  const byTag: Record<string, number> = {};
  const byCapability: Record<string, number> = {};
  let chefs = 0;

  for (const mode of modes) {
    for (const tag of mode.tags) {
      byTag[tag] = (byTag[tag] || 0) + 1;
    }
    for (const cap of mode.capabilities) {
      byCapability[cap] = (byCapability[cap] || 0) + 1;
    }
    if (mode.isChef) chefs++;
  }

  return {
    total: modes.length,
    byTag,
    byCapability,
    chefs,
    stubs: 0,
    aliases: 0,
    disabled: 0,
    enabled: modes.length,
  };
}
