export type AgentType = 'claude' | 'openclaw' | 'cursor' | 'unknown';
export interface AgentInfo {
    type: AgentType;
    skillsDir: string;
    name: string;
}
export declare function detectAgent(): AgentInfo;
