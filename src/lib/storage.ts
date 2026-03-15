import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import type { AgentInfo } from './detect-agent.js';

export function writeSkill(agent: AgentInfo, skillName: string, content: string): string {
  const skillDir = path.join(agent.skillsDir, skillName);
  fs.mkdirSync(skillDir, { recursive: true });

  const filePath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(filePath, content, 'utf-8');

  return filePath;
}

export function listInstalledSkills(agent: AgentInfo): string[] {
  if (!fs.existsSync(agent.skillsDir)) {
    return [];
  }

  return fs
    .readdirSync(agent.skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join(agent.skillsDir, d.name, 'SKILL.md')))
    .map((d) => d.name);
}

export function getConfigPath(): string {
  return path.join(os.homedir(), '.xpay', 'config.json');
}

export function readConfig(): Record<string, string> {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export function writeConfig(key: string, value: string): void {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const config = readConfig();
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
