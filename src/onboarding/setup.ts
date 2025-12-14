import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface OnboardingConfig {
  geminiApiKey: string;
  projectName: string;
  workspaceRoot: string;
  dashboardPort: number;
  enableDashboard: boolean;
  customModesPaths: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMonitoring: boolean;
}

interface SetupState {
  config: OnboardingConfig;
  configPath: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

function printHeader(): void {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          Num Agents v3.0 - Setup & Onboarding              ║');
  console.log('║                © 2025 Numtema Foundry AI                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

function printSection(title: string): void {
  console.log(`\n📋 ${title}`);
  console.log('─'.repeat(60));
}

function printSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function printInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

function printWarning(message: string): void {
  console.log(`⚠️  ${message}`);
}

function printError(message: string): void {
  console.log(`❌ ${message}`);
}

async function getGeminiApiKey(): Promise<string> {
  printSection('Gemini API Configuration');
  console.log('Get your API key from: https://aistudio.google.com/app/apikey\n');

  let apiKey = '';
  while (!apiKey) {
    apiKey = await question('Enter your Gemini API Key (or press Enter to skip): ');
    if (!apiKey) {
      printWarning('Skipping API key configuration. You can set it later via environment variables.');
      return '';
    }
    if (apiKey.length < 20) {
      printError('API key seems too short. Please try again.');
      apiKey = '';
    }
  }
  printSuccess(`API key configured (${apiKey.substring(0, 10)}...)`);
  return apiKey;
}

async function getProjectName(): Promise<string> {
  printSection('Project Configuration');
  const defaultName = 'num-agents-project';
  const name = await question(`Project name (default: ${defaultName}): `);
  return name || defaultName;
}

async function getWorkspaceRoot(): Promise<string> {
  const defaultRoot = process.cwd();
  const root = await question(`Workspace root (default: ${defaultRoot}): `);
  return root || defaultRoot;
}

async function getDashboardPort(): Promise<number> {
  const defaultPort = 3457;
  const portStr = await question(`Dashboard port (default: ${defaultPort}): `);
  const port = parseInt(portStr, 10);
  return isNaN(port) ? defaultPort : port;
}

async function getEnableDashboard(): Promise<boolean> {
  const answer = await question('Enable dashboard? (y/n, default: y): ');
  return answer.toLowerCase() !== 'n';
}

async function getCustomModesPaths(): Promise<string[]> {
  printSection('Custom Modes Configuration');
  console.log('Specify paths to custom modes directories (one per line, empty to finish)\n');

  const paths: string[] = [];
  let count = 1;

  while (true) {
    const pathInput = await question(`Custom modes path ${count} (or press Enter to finish): `);
    if (!pathInput) break;
    if (fs.existsSync(pathInput)) {
      paths.push(pathInput);
      printSuccess(`Added: ${pathInput}`);
      count++;
    } else {
      printWarning(`Path does not exist: ${pathInput}`);
    }
  }

  if (paths.length === 0) {
    paths.push('./custom_modes.d');
    printInfo('Using default: ./custom_modes.d');
  }

  return paths;
}

async function getLogLevel(): Promise<'debug' | 'info' | 'warn' | 'error'> {
  printSection('Logging Configuration');
  console.log('Available levels: debug, info, warn, error\n');
  const level = await question('Log level (default: info): ');
  const validLevels = ['debug', 'info', 'warn', 'error'];
  return (validLevels.includes(level) ? level : 'info') as 'debug' | 'info' | 'warn' | 'error';
}

async function getEnableMonitoring(): Promise<boolean> {
  const answer = await question('Enable Prometheus monitoring? (y/n, default: y): ');
  return answer.toLowerCase() !== 'n';
}

async function createConfigFile(config: OnboardingConfig, configPath: string): Promise<void> {
  const configContent = {
    version: '3.0.1',
    project: {
      name: config.projectName,
      workspaceRoot: config.workspaceRoot,
    },
    server: {
      dashboard: {
        enabled: config.enableDashboard,
        port: config.dashboardPort,
      },
      logging: {
        level: config.logLevel,
      },
      monitoring: {
        enabled: config.enableMonitoring,
      },
    },
    modes: {
      paths: config.customModesPaths,
    },
    api: {
      gemini: {
        keyConfigured: !!config.geminiApiKey,
      },
    },
    createdAt: new Date().toISOString(),
  };

  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  printSuccess(`Configuration saved to: ${configPath}`);
}

async function createEnvFile(config: OnboardingConfig): Promise<void> {
  const envPath = path.join(config.workspaceRoot, '.env.local');
  let envContent = `# Num Agents v3.0 Configuration
# Generated: ${new Date().toISOString()}

# Gemini API Configuration
${config.geminiApiKey ? `GEMINI_API_KEY=${config.geminiApiKey}` : '# GEMINI_API_KEY=your_api_key_here'}

# Server Configuration
MCP_PORT=${config.dashboardPort}
NODE_ENV=development
LOG_LEVEL=${config.logLevel}

# Dashboard
DASHBOARD_ENABLED=${config.enableDashboard}
DASHBOARD_PORT=${config.dashboardPort}

# Monitoring
MONITORING_ENABLED=${config.enableMonitoring}

# Custom Modes Paths
MODES_PATHS=${config.customModesPaths.join(',')}
`;

  fs.writeFileSync(envPath, envContent);
  printSuccess(`Environment file created: ${envPath}`);
  printInfo('Add this file to .gitignore to keep secrets safe');
}

async function createStartScript(config: OnboardingConfig): Promise<void> {
  const scriptPath = path.join(config.workspaceRoot, 'start-dev.sh');
  const scriptContent = `#!/bin/bash
# Num Agents v3.0 Development Server

set -e

echo "🚀 Starting Num Agents v3.0..."

# Load environment variables
if [ -f .env.local ]; then
  export \$(cat .env.local | grep -v '^#' | xargs)
fi

# Build TypeScript
echo "📦 Building TypeScript..."
npm run build

# Start the server
echo "🎯 Starting MCP server on port ${config.dashboardPort}..."
node scripts/start-mcp-server.mjs \\
  --modes-path ${config.customModesPaths.join(' --modes-path ')} \\
  --dashboard-port ${config.dashboardPort} \\
  ${config.enableDashboard ? '' : '--no-dashboard'}

echo "✅ Server started!"
echo "📊 Dashboard: http://127.0.0.1:${config.dashboardPort}"
`;

  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, 0o755);
  printSuccess(`Start script created: ${scriptPath}`);
}

async function createDockerCompose(config: OnboardingConfig): Promise<void> {
  const dockerPath = path.join(config.workspaceRoot, 'docker-compose.dev.yml');
  const dockerContent = `version: '3.8'

services:
  num-agents:
    build: .
    ports:
      - "${config.dashboardPort}:${config.dashboardPort}"
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - MCP_PORT=${config.dashboardPort}
      - LOG_LEVEL=${config.logLevel}
      - NODE_ENV=development
    volumes:
      - ./custom_modes.d:/app/custom_modes.d
      - ./data:/app/data
    command: node scripts/start-mcp-server.mjs --modes-path ./custom_modes.d --dashboard-port ${config.dashboardPort}

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
`;

  fs.writeFileSync(dockerPath, dockerContent);
  printSuccess(`Docker Compose file created: ${dockerPath}`);
}

async function createPackageJsonScripts(config: OnboardingConfig): Promise<void> {
  const packageJsonPath = path.join(config.workspaceRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    printWarning('package.json not found. Skipping script updates.');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts['start:dev'] = `node scripts/start-mcp-server.mjs --modes-path ${config.customModesPaths.join(' --modes-path ')} --dashboard-port ${config.dashboardPort}`;
  packageJson.scripts['start:docker'] = 'docker-compose -f docker-compose.dev.yml up';
  packageJson.scripts['setup'] = 'node dist/onboarding/setup.js';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  printSuccess('package.json scripts updated');
}

async function printSummary(config: OnboardingConfig): Promise<void> {
  printSection('Setup Complete! 🎉');
  console.log('\n📊 Configuration Summary:');
  console.log(`  Project: ${config.projectName}`);
  console.log(`  Workspace: ${config.workspaceRoot}`);
  console.log(`  Dashboard: ${config.enableDashboard ? `Enabled (port ${config.dashboardPort})` : 'Disabled'}`);
  console.log(`  Custom Modes: ${config.customModesPaths.join(', ')}`);
  console.log(`  Log Level: ${config.logLevel}`);
  console.log(`  Monitoring: ${config.enableMonitoring ? 'Enabled' : 'Disabled'}`);

  console.log('\n🚀 Next Steps:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Build the project: npm run build');
  console.log(`  3. Start the server: npm run start:dev`);
  console.log(`  4. Open dashboard: http://127.0.0.1:${config.dashboardPort}`);

  console.log('\n📚 Documentation:');
  console.log('  - System Guide: SYSTEM_GUIDE.md');
  console.log('  - API Docs: README.md');
  console.log('  - Deployment: BUNDLE_DEPLOYMENT.md');

  console.log('\n💡 Tips:');
  console.log('  - Set GEMINI_API_KEY in .env.local for API calls');
  console.log('  - Add custom modes to ./custom_modes.d/');
  console.log('  - Use Docker Compose for isolated environment');
  console.log('  - Check logs in .num-agents/logs/');

  console.log('\n');
}

export async function runOnboarding(): Promise<SetupState> {
  printHeader();

  console.log('Welcome to Num Agents v3.0 Setup!\n');
  console.log('This wizard will help you configure your MCP server.\n');

  const config: OnboardingConfig = {
    geminiApiKey: await getGeminiApiKey(),
    projectName: await getProjectName(),
    workspaceRoot: await getWorkspaceRoot(),
    dashboardPort: await getDashboardPort(),
    enableDashboard: await getEnableDashboard(),
    customModesPaths: await getCustomModesPaths(),
    logLevel: await getLogLevel(),
    enableMonitoring: await getEnableMonitoring(),
  };

  const configPath = path.join(config.workspaceRoot, '.num-agents', 'config.json');

  printSection('Creating Configuration Files');

  await createConfigFile(config, configPath);
  await createEnvFile(config);
  await createStartScript(config);
  await createDockerCompose(config);
  await createPackageJsonScripts(config);

  await printSummary(config);

  rl.close();

  return { config, configPath };
}

if (require.main === module) {
  runOnboarding().catch((err) => {
    printError(`Setup failed: ${err.message}`);
    process.exit(1);
  });
}

export default runOnboarding;
