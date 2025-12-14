import * as fs from 'fs';
import * as path from 'path';

interface QuickStartConfig {
  geminiApiKey?: string;
  dashboardPort?: number;
  customModesPaths?: string[];
}

export async function quickStart(config: QuickStartConfig = {}): Promise<void> {
  const workspaceRoot = process.cwd();
  const port = config.dashboardPort || 3457;
  const paths = config.customModesPaths || ['./custom_modes.d'];

  // Create .env.local
  const envPath = path.join(workspaceRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    const envContent = `GEMINI_API_KEY=${config.geminiApiKey || 'your_api_key_here'}
MCP_PORT=${port}
NODE_ENV=development
LOG_LEVEL=info
DASHBOARD_ENABLED=true
MONITORING_ENABLED=true
`;
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created .env.local`);
  }

  // Create custom_modes.d directory
  const modesDir = path.join(workspaceRoot, 'custom_modes.d');
  if (!fs.existsSync(modesDir)) {
    fs.mkdirSync(modesDir, { recursive: true });
    console.log(`✅ Created custom_modes.d directory`);
  }

  // Create .num-agents config
  const configDir = path.join(workspaceRoot, '.num-agents');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const configPath = path.join(configDir, 'config.json');
  const configContent = {
    version: '3.0.1',
    initialized: true,
    initializedAt: new Date().toISOString(),
    dashboardPort: port,
    customModesPaths: paths,
  };
  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  console.log(`✅ Created .num-agents/config.json`);

  console.log(`\n🚀 Quick Start Complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. npm install`);
  console.log(`  2. npm run build`);
  console.log(`  3. npm run start:dev`);
  console.log(`\n📊 Dashboard will be available at: http://127.0.0.1:${port}`);
}

if (require.main === module) {
  const apiKey = process.env.GEMINI_API_KEY;
  quickStart({ geminiApiKey: apiKey }).catch(console.error);
}

export default quickStart;
