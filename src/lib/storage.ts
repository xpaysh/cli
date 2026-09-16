import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { CONFIG_DIR, CONFIG_FILE } from './constants.js';
import type { AgentInfo } from './detect-agent.js';

// --- Skills ---

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

export function getSkillInstallDate(agent: AgentInfo, skillName: string): Date | null {
  const filePath = path.join(agent.skillsDir, skillName, 'SKILL.md');
  if (!fs.existsSync(filePath)) return null;
  return fs.statSync(filePath).mtime;
}

// --- Config ---

export function getConfigDir(): string {
  return path.join(os.homedir(), CONFIG_DIR);
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), CONFIG_FILE);
}

export function readConfig(): Record<string, string> {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return {};
  }
}

export function writeConfigValue(key: string, value: string): void {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const config = readConfig();
  config[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function clearCache(): void {
  const cacheDir = path.join(getConfigDir(), 'cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
}
