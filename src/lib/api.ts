import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { API_BASE, SKILLS_BASE, MCP_BASE, CACHE_TTL_MS, CONFIG_DIR, CACHE_DIR } from './constants.js';
import { getApiKey } from './auth.js';
import type {
  ServersResponse,
  CollectionsResponse,
  CollectionDetailResponse,
  BalanceResponse,
  IntrospectResponse,
  CheckSlugResponse,
  AiPricingResponse,
  Tool,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
} from '../types/api.js';

// --- Cache ---

function getCacheDir(): string {
  return path.join(os.homedir(), CONFIG_DIR, CACHE_DIR);
}

function getCached<T>(key: string): T | null {
  const cacheFile = path.join(getCacheDir(), `${key}.json`);
  if (!fs.existsSync(cacheFile)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    if (Date.now() - data.timestamp < CACHE_TTL_MS) {
      return data.value as T;
    }
    fs.unlinkSync(cacheFile);
  } catch {
    // corrupt cache
  }
  return null;
}

function setCache(key: string, value: unknown): void {
  const dir = getCacheDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${key}.json`),
    JSON.stringify({ timestamp: Date.now(), value }),
    'utf-8'
  );
}

// --- Helpers ---

async function apiGet<T>(endpoint: string, auth = false): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const key = getApiKey();
    if (key) headers['Authorization'] = `Bearer ${key}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<T>(endpoint: string, body: unknown, auth = false): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const key = getApiKey();
    if (key) headers['Authorization'] = `Bearer ${key}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// --- Public API ---

export async function listServers(useCache = true): Promise<ServersResponse> {
  if (useCache) {
    const cached = getCached<ServersResponse>('servers');
    if (cached) return cached;
  }
  const data = await apiGet<ServersResponse>('/public/servers');
  setCache('servers', data);
  return data;
}

export async function listCollections(): Promise<CollectionsResponse> {
  const cached = getCached<CollectionsResponse>('collections');
  if (cached) return cached;
  const data = await apiGet<CollectionsResponse>('/public/collections');
  setCache('collections', data);
  return data;
}

export async function getCollection(slug: string): Promise<CollectionDetailResponse> {
  return apiGet<CollectionDetailResponse>(`/public/collection/${slug}`);
}

export async function introspect(url: string): Promise<IntrospectResponse> {
  return apiPost<IntrospectResponse>('/public/introspect', { url });
}

export async function checkSlug(slug: string): Promise<CheckSlugResponse> {
  return apiGet<CheckSlugResponse>(`/public/check-slug?slug=${encodeURIComponent(slug)}`);
}

export async function getAiPricing(tools: Tool[], serverName: string): Promise<AiPricingResponse> {
  return apiPost<AiPricingResponse>('/public/ai-pricing', { tools, serverName });
}

// --- Auth API ---

export async function getBalance(): Promise<BalanceResponse> {
  return apiGet<BalanceResponse>('/wallet/balance', true);
}

// --- Skills API ---

export async function fetchSkillMd(skillPath: string): Promise<string> {
  const url = `${SKILLS_BASE}/skills/${skillPath}/SKILL.md`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch skill: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export async function fetchMasterIndex(): Promise<string> {
  const res = await fetch(`${SKILLS_BASE}/skill.md`);
  if (!res.ok) {
    throw new Error(`Failed to fetch skill index: ${res.status}`);
  }
  return res.text();
}

// --- MCP Execution ---

export async function mcpCall(
  method: string,
  params?: Record<string, unknown>,
  serverSlug?: string
): Promise<McpJsonRpcResponse> {
  const key = getApiKey();
  if (!key) throw new Error('Not authenticated. Run `xpay login` first.');

  const url = `${MCP_BASE}?key=${key}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (serverSlug) {
    headers['X-MCP-Server-Slug'] = serverSlug;
  }

  const request: McpJsonRpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MCP error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<McpJsonRpcResponse>;
}

// --- Search ---

export function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/);
  return terms.every((term) => lower.includes(term));
}
