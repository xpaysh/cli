import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export type AgentType = 'claude' | 'openclaw' | 'cursor' | 'claude-desktop' | 'unknown';

export interface AgentInfo {
  type: AgentType;
  skillsDir: string;
  name: string;
}

export function detectAgent(): AgentInfo {
  const home = os.homedir();

  const agents: AgentInfo[] = [
    {
      type: 'claude',
      skillsDir: path.join(home, '.claude', 'skills'),
      name: 'Claude Code',
    },
    {
      type: 'openclaw',
      skillsDir: path.join(home, '.openclaw', 'skills'),
      name: 'OpenClaw',
    },
    {
      type: 'cursor',
      skillsDir: path.join(home, '.cursor', 'skills'),
      name: 'Cursor',
    },
    {
      type: 'claude-desktop',
      skillsDir: path.join(home, '.claude', 'skills'),
      name: 'Claude Desktop',
    },
  ];

  for (const agent of agents) {
    const parentDir = path.dirname(agent.skillsDir);
    if (fs.existsSync(parentDir)) {
      return agent;
    }
  }

  // Default to Claude Code
  return agents[0];
}

export function getAgentByType(type: string): AgentInfo {
  const home = os.homedir();
  const map: Record<string, AgentInfo> = {
    claude: { type: 'claude', skillsDir: path.join(home, '.claude', 'skills'), name: 'Claude Code' },
    openclaw: { type: 'openclaw', skillsDir: path.join(home, '.openclaw', 'skills'), name: 'OpenClaw' },
    cursor: { type: 'cursor', skillsDir: path.join(home, '.cursor', 'skills'), name: 'Cursor' },
    'claude-desktop': { type: 'claude-desktop', skillsDir: path.join(home, '.claude', 'skills'), name: 'Claude Desktop' },
  };
  return map[type] || map.claude;
}
