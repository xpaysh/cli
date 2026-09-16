import * as fs from 'node:fs';
import * as path from 'node:path';
import type { XpayManifest } from '../types/api.js';

const MANIFEST_FILE = 'xpay.json';

export function findManifest(startDir?: string): string | null {
  let dir = startDir || process.cwd();
  while (true) {
    const candidate = path.join(dir, MANIFEST_FILE);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function readManifest(filePath?: string): XpayManifest | null {
  const manifestPath = filePath || findManifest();
  if (!manifestPath) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch {
    return null;
  }
}

export function writeManifest(manifest: XpayManifest, filePath?: string): string {
  const manifestPath = filePath || path.join(process.cwd(), MANIFEST_FILE);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  return manifestPath;
}

export function addToolToManifest(slug: string, filePath?: string): void {
  const manifestPath = filePath || findManifest();
  if (!manifestPath) return;

  const manifest = readManifest(manifestPath);
  if (!manifest) return;

  if (!manifest.tools) manifest.tools = {};
  manifest.tools[slug] = {
    installedAt: new Date().toISOString(),
  };
  writeManifest(manifest, manifestPath);
}

export function addCollectionToManifest(slug: string, filePath?: string): void {
  const manifestPath = filePath || findManifest();
  if (!manifestPath) return;

  const manifest = readManifest(manifestPath);
  if (!manifest) return;

  if (!manifest.collections) manifest.collections = {};
  manifest.collections[slug] = {
    installedAt: new Date().toISOString(),
  };
  writeManifest(manifest, manifestPath);
}

export function createDefaultManifest(name: string, description?: string): XpayManifest {
  return {
    name,
    description: description || '',
    tools: {},
    collections: {},
    budget: {
      daily: 5,
      monthly: 50,
    },
    mcp: {
      server: 'https://mcp.xpay.sh/mcp',
    },
  };
}
