import type { AgentInfo } from './detect-agent.js';
export declare function writeSkill(agent: AgentInfo, skillName: string, content: string): string;
export declare function listInstalledSkills(agent: AgentInfo): string[];
export declare function getConfigPath(): string;
export declare function readConfig(): Record<string, string>;
export declare function writeConfig(key: string, value: string): void;
