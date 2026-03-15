import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export type AgentType = 'claude' | 'openclaw' | 'cursor' | 'unknown';

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
  ];

  for (const agent of agents) {
    const parentDir = path.dirname(agent.skillsDir);
    if (fs.existsSync(parentDir)) {
      return agent;
    }
  }

  // Default to Claude
  return agents[0];
}
