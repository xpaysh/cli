import { readConfig, writeConfigValue } from './storage.js';

const API_KEY_KEY = 'api-key';

export function getApiKey(): string | undefined {
  const config = readConfig();
  return config[API_KEY_KEY] || process.env.XPAY_API_KEY;
}

export function setApiKey(key: string): void {
  writeConfigValue(API_KEY_KEY, key);
}

export function isAuthenticated(): boolean {
  return !!getApiKey();
}

export function requireApiKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new Error('Not authenticated. Run `xpay login` to set your API key.');
  }
  return key;
}

export function maskKey(key: string): string {
  if (key.length <= 12) return '****';
  return key.slice(0, 12) + '****' + key.slice(-4);
}
