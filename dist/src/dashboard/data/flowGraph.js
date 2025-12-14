export function generateFlowGraph(mode) {
    const flow = mode.flow;
    if (!flow) {
        return {
            nodes: [{ id: "start", type: "start", label: "Start" }],
            edges: [],
            title: "Empty Flow",
        };
    }
    const nodes = [];
    const edges = [];
    // Add start node
    nodes.push({ id: "start", type: "start", label: "Start", x: 50, y: 50 });
    // Process flow nodes
    const flowNodes = flow.nodes || [];
    let yOffset = 150;
    for (const node of flowNodes) {
        const nodeId = node.id || `node-${Math.random()}`;
        const nodeType = node.role ? "role" : node.action ? "action" : "decision";
        const label = node.name || node.goal || nodeId;
        nodes.push({
            id: nodeId,
            type: nodeType,
            label,
            x: 50,
            y: yOffset,
            color: nodeType === "role" ? "#3B82F6" : nodeType === "action" ? "#10B981" : "#F59E0B",
        });
        yOffset += 100;
    }
    // Add end node
    nodes.push({ id: "end", type: "end", label: "End", x: 50, y: yOffset });
    // Process edges
    const flowEdges = flow.edges || [];
    for (const edge of flowEdges) {
        edges.push({
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            label: edge.label,
        });
    }
    // Auto-connect nodes if no edges
    if (edges.length === 0 && flowNodes.length > 0) {
        edges.push({ id: "start-first", source: "start", target: flowNodes[0].id });
        for (let i = 0; i < flowNodes.length - 1; i++) {
            edges.push({
                id: `${flowNodes[i].id}-${flowNodes[i + 1].id}`,
                source: flowNodes[i].id,
                target: flowNodes[i + 1].id,
            });
        }
        edges.push({ id: `last-end`, source: flowNodes[flowNodes.length - 1].id, target: "end" });
    }
    return {
        nodes,
        edges,
        title: mode.name || "Flow Graph",
    };
}
export function generateSVG(graph) {
    const width = 400;
    const height = Math.max(500, (graph.nodes.length + 1) * 120);
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #e2e8f0; border-radius: 8px;">`;
    // Draw edges first (so they appear behind nodes)
    for (const edge of graph.edges) {
        const sourceNode = graph.nodes.find((n) => n.id === edge.source);
        const targetNode = graph.nodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
            const x1 = sourceNode.x || 50;
            const y1 = (sourceNode.y || 50) + 40;
            const x2 = targetNode.x || 50;
            const y2 = targetNode.y || 50;
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>`;
            if (edge.label) {
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                svg += `<text x="${midX + 10}" y="${midY}" font-size="12" fill="#64748b">${edge.label}</text>`;
            }
        }
    }
    // Draw arrow marker
    svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#94a3b8"/></marker></defs>`;
    // Draw nodes
    for (const node of graph.nodes) {
        const x = node.x ?? 50;
        const y = node.y ?? 50;
        const color = node.color || "#059669";
        const bgColor = node.type === "start" ? "#10B981" : node.type === "end" ? "#EF4444" : color;
        if (node.type === "start" || node.type === "end") {
            // Circle for start/end
            svg += `<circle cx="${x}" cy="${y}" r="25" fill="${bgColor}" stroke="#fff" stroke-width="2"/>`;
        }
        else {
            // Rectangle for other nodes
            svg += `<rect x="${x - 40}" y="${y - 25}" width="80" height="50" rx="5" fill="${bgColor}" stroke="#fff" stroke-width="2"/>`;
        }
        svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold">${node.label}</text>`;
    }
    svg += `</svg>`;
    return svg;
}
export function calculateLayout(graph) {
    const layoutGraph = JSON.parse(JSON.stringify(graph));
    const nodeCount = layoutGraph.nodes.length;
    const spacing = 100;
    for (let i = 0; i < layoutGraph.nodes.length; i++) {
        const node = layoutGraph.nodes[i];
        if (node) {
            node.x = 50;
            node.y = 50 + i * spacing;
        }
    }
    return layoutGraph;
}
