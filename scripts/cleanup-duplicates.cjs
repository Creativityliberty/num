const fs = require('fs');
const path = require('path');

function cleanupAgent(agentPath, agentId) {
  try {
    let content = fs.readFileSync(agentPath, 'utf-8');

    // Count occurrences of "agent:" at the start of lines
    const agentMatches = content.match(/^agent:/gm) || [];
    
    if (agentMatches.length <= 1) {
      console.log(`✓ ${agentId}: No duplicates found`);
      return;
    }

    console.log(`⚠️  ${agentId}: Found ${agentMatches.length} 'agent:' sections - cleaning...`);

    // Find all agent sections
    const lines = content.split('\n');
    let firstAgentIndex = -1;
    let secondAgentIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^agent:/)) {
        if (firstAgentIndex === -1) {
          firstAgentIndex = i;
        } else if (secondAgentIndex === -1) {
          secondAgentIndex = i;
          break;
        }
      }
    }

    if (firstAgentIndex === -1 || secondAgentIndex === -1) {
      console.log(`⚠️  ${agentId}: Could not find duplicate sections`);
      return;
    }

    // Keep the first agent section, remove everything from the second one onwards
    const cleanedLines = lines.slice(0, secondAgentIndex);
    const cleanedContent = cleanedLines.join('\n').trim() + '\n';

    fs.writeFileSync(agentPath, cleanedContent, 'utf-8');
    console.log(`✅ ${agentId}: Cleaned (removed ${agentMatches.length - 1} duplicate section(s))`);
  } catch (error) {
    console.error(`❌ Error cleaning ${agentId}:`, error.message);
  }
}

function main() {
  const customModesDir = path.join(__dirname, '../custom_modes.d');

  if (!fs.existsSync(customModesDir)) {
    console.error(`❌ Directory not found: ${customModesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(customModesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  console.log(`🧹 Cleaning up duplicate sections in ${files.length} agents...\n`);

  files.forEach(file => {
    const agentId = file.replace(/\.(yaml|yml|agent\.yaml)$/, '');
    const agentPath = path.join(customModesDir, file);
    cleanupAgent(agentPath, agentId);
  });

  console.log(`\n✅ Cleanup complete!`);
}

main();
