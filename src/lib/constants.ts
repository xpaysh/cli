export const VERSION = '0.2.0';

export const API_BASE =
  process.env.XPAY_API_URL || 'https://isk8sy88i9.execute-api.us-east-1.amazonaws.com/prod';

export const MCP_BASE = process.env.XPAY_MCP_URL || 'https://mcp.xpay.sh/mcp';

export const SKILLS_BASE = 'https://xpay.tools';

export const ACCOUNT_URL = 'https://xpay.tools/account/settings/api-keys';

export const CONFIG_DIR = '.xpay';
export const CONFIG_FILE = 'config.json';
export const CACHE_DIR = 'cache';

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
