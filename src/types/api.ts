export interface Server {
  slug: string;
  name: string;
  description: string;
  overview?: string;
  tools: Tool[];
  toolCount: number;
  category?: string;
  tier?: number;
  totalCalls: number;
  isPlatform?: boolean;
  listing?: string;
  createdAt?: number;
  health?: {
    allPassed: boolean;
    totalLatency: number;
    testedAt: number;
  };
}

export interface Tool {
  name: string;
  description: string;
  price?: number;
  pricingModel?: string;
  inputSchema?: Record<string, unknown>;
}

export interface Collection {
  collectionId: string;
  slug: string;
  mcpSlug?: string;
  name: string;
  description: string;
  longDescription?: string;
  icon?: string;
  accentColor?: string;
  toolRefs: string[];
  featured?: boolean;
  sortOrder?: number;
  strategy?: string;
  tagline?: string;
  status?: string;
  totalProviders: number;
  totalTools: number;
}

export interface BalanceResponse {
  balance: number;
  credits: number;
  available: number;
}

export interface ServersResponse {
  servers: Server[];
  totalServers: number;
  totalTools: number;
}

export interface CollectionsResponse {
  collections: Collection[];
}

export interface CollectionDetailResponse {
  collection: Collection;
  servers: Server[];
  totalProviders: number;
  totalTools: number;
  totalCalls: number;
}

export interface IntrospectResponse {
  valid: boolean;
  serverInfo: { name: string; version: string };
  protocolVersion: string;
  toolCount: number;
  tools: Tool[];
}

export interface CheckSlugResponse {
  slug: string;
  available: boolean;
  reason?: string;
  suggestion?: string;
}

export interface AiPricingResponse {
  description: string;
  overview: string;
  recommendations: {
    toolName: string;
    price: number;
    reasoning: string;
  }[];
}

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface XpayManifest {
  name: string;
  description?: string;
  tools: Record<string, { version?: string; installedAt?: string }>;
  collections: Record<string, { installedAt?: string }>;
  budget?: {
    daily?: number;
    monthly?: number;
  };
  mcp?: {
    server?: string;
  };
}
