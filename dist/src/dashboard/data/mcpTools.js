export const MCP_TOOLS = [
    {
        name: "read_file",
        description: "Read the contents of a file from the workspace",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The file path to read",
                },
            },
            required: ["path"],
        },
        examples: [
            {
                title: "Read a TypeScript file",
                input: { path: "src/index.ts" },
                output: "File contents...",
            },
        ],
    },
    {
        name: "write_file",
        description: "Write contents to a file in the workspace",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The file path to write",
                },
                contents: {
                    type: "string",
                    description: "The file contents",
                },
            },
            required: ["path", "contents"],
        },
    },
    {
        name: "list_directory",
        description: "List files and directories in a folder",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The directory path to list",
                },
            },
            required: ["path"],
        },
    },
    {
        name: "git_status",
        description: "Get the status of the Git repository",
        category: "git",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "git_diff",
        description: "Show differences between branches or commits",
        category: "git",
        inputSchema: {
            type: "object",
            properties: {
                target: {
                    type: "string",
                    description: "The target branch or commit",
                },
            },
            required: ["target"],
        },
    },
    {
        name: "git_commit",
        description: "Create a Git commit with the given message",
        category: "git",
        inputSchema: {
            type: "object",
            properties: {
                message: {
                    type: "string",
                    description: "The commit message",
                },
            },
            required: ["message"],
        },
    },
    {
        name: "git_push",
        description: "Push commits to the remote repository",
        category: "git",
        inputSchema: {
            type: "object",
            properties: {
                branch: {
                    type: "string",
                    description: "The branch to push",
                },
            },
        },
    },
    {
        name: "run_command",
        description: "Execute a shell command in the workspace",
        category: "execution",
        inputSchema: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "The command to execute",
                },
                cwd: {
                    type: "string",
                    description: "The working directory",
                },
            },
            required: ["command"],
        },
    },
    {
        name: "search_files",
        description: "Search for files matching a pattern",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                pattern: {
                    type: "string",
                    description: "The search pattern (glob)",
                },
                path: {
                    type: "string",
                    description: "The directory to search in",
                },
            },
            required: ["pattern"],
        },
    },
    {
        name: "grep_search",
        description: "Search for text in files",
        category: "search",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The text to search for",
                },
                path: {
                    type: "string",
                    description: "The directory to search in",
                },
            },
            required: ["query", "path"],
        },
    },
    {
        name: "code_search",
        description: "Search the codebase for code patterns",
        category: "search",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The code pattern to search for",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "create_file",
        description: "Create a new file with contents",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The file path to create",
                },
                contents: {
                    type: "string",
                    description: "The initial file contents",
                },
            },
            required: ["path", "contents"],
        },
    },
    {
        name: "delete_file",
        description: "Delete a file from the workspace",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The file path to delete",
                },
            },
            required: ["path"],
        },
    },
    {
        name: "rename_file",
        description: "Rename or move a file",
        category: "filesystem",
        inputSchema: {
            type: "object",
            properties: {
                oldPath: {
                    type: "string",
                    description: "The current file path",
                },
                newPath: {
                    type: "string",
                    description: "The new file path",
                },
            },
            required: ["oldPath", "newPath"],
        },
    },
    {
        name: "analyze_code",
        description: "Analyze code for issues and suggestions",
        category: "analysis",
        inputSchema: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The file path to analyze",
                },
                language: {
                    type: "string",
                    description: "The programming language",
                },
            },
            required: ["path"],
        },
    },
];
export function getToolsByCategory(category) {
    return MCP_TOOLS.filter((t) => t.category === category);
}
export function getToolByName(name) {
    return MCP_TOOLS.find((t) => t.name === name);
}
export function getAllCategories() {
    const categories = new Set(MCP_TOOLS.map((t) => t.category));
    return Array.from(categories).sort();
}
