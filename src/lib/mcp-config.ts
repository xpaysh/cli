import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { MCP_BASE } from './constants.js';
import { getApiKey } from './auth.js';

export type McpAgent = 'claude-code' | 'cursor' | 'claude-desktop';

export function getMcpUrl(): string {
  const key = getApiKey();
  if (!key) return `${MCP_BASE}?key=YOUR_API_KEY`;
  return `${MCP_BASE}?key=${key}`;
}

export function configureMcp(agent?: McpAgent): { configured: boolean; agent: string; message: string } {
  const key = getApiKey();
  if (!key) {
    return { configured: false, agent: 'unknown', message: 'No API key set. Run `xpay login` first.' };
  }

  const mcpUrl = getMcpUrl();

  // Try Claude Code first
  if (!agent || agent === 'claude-code') {
    try {
      execSync(`which claude`, { stdio: 'ignore' });
      execSync(`claude mcp add --transport http xpay "${mcpUrl}"`, { stdio: 'ignore' });
      return { configured: true, agent: 'claude-code', message: 'MCP server configured for Claude Code.' };
    } catch {
      if (agent === 'claude-code') {
        return { configured: false, agent: 'claude-code', message: 'Claude Code CLI not found.' };
      }
    }
  }

  // Try Cursor
  if (!agent || agent === 'cursor') {
    const cursorConfig = path.join(os.homedir(), '.cursor', 'mcp.json');
    if (!agent && !fs.existsSync(path.dirname(cursorConfig))) {
      // Skip if cursor not installed and not explicitly requested
    } else {
      try {
        let config: Record<string, unknown> = {};
        if (fs.existsSync(cursorConfig)) {
          config = JSON.parse(fs.readFileSync(cursorConfig, 'utf-8'));
        }
        const mcpServers = (config.mcpServers || {}) as Record<string, unknown>;
        mcpServers.xpay = {
          url: mcpUrl,
          transport: 'http',
        };
        config.mcpServers = mcpServers;
        fs.mkdirSync(path.dirname(cursorConfig), { recursive: true });
        fs.writeFileSync(cursorConfig, JSON.stringify(config, null, 2), 'utf-8');
        return { configured: true, agent: 'cursor', message: 'MCP server configured for Cursor.' };
      } catch {
        if (agent === 'cursor') {
          return { configured: false, agent: 'cursor', message: 'Failed to write Cursor MCP config.' };
        }
      }
    }
  }

  // Claude Desktop
  if (!agent || agent === 'claude-desktop') {
    const platform = process.platform;
    const claudeDesktopConfig =
      platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
        : platform === 'win32'
          ? path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
          : path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');

    if (fs.existsSync(path.dirname(claudeDesktopConfig))) {
      try {
        let config: Record<string, unknown> = {};
        if (fs.existsSync(claudeDesktopConfig)) {
          config = JSON.parse(fs.readFileSync(claudeDesktopConfig, 'utf-8'));
        }
        const mcpServers = (config.mcpServers || {}) as Record<string, unknown>;
        mcpServers.xpay = {
          url: mcpUrl,
          transport: 'http',
        };
        config.mcpServers = mcpServers;
        fs.writeFileSync(claudeDesktopConfig, JSON.stringify(config, null, 2), 'utf-8');
        return { configured: true, agent: 'claude-desktop', message: 'MCP server configured for Claude Desktop.' };
      } catch {
        if (agent === 'claude-desktop') {
          return { configured: false, agent: 'claude-desktop', message: 'Failed to write Claude Desktop config.' };
        }
      }
    }
  }

  return {
    configured: false,
    agent: 'unknown',
    message: `Configure MCP manually:\n  claude mcp add --transport http xpay "${mcpUrl}"`,
  };
}

export function isMcpConfigured(): boolean {
  // Check Claude Code
  try {
    const result = execSync('claude mcp list 2>/dev/null', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (result.includes('xpay')) return true;
  } catch {
    // not available
  }

  // Check Cursor
  const cursorConfig = path.join(os.homedir(), '.cursor', 'mcp.json');
  if (fs.existsSync(cursorConfig)) {
    try {
      const config = JSON.parse(fs.readFileSync(cursorConfig, 'utf-8'));
      if (config.mcpServers?.xpay) return true;
    } catch {
      // corrupt config
    }
  }

  return false;
}
