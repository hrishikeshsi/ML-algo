// Shapes for the real Purple Fabric / Magic Platform GenAI API (see apidoc.json).
// The captured Postman collection recorded every response body as empty ("response": []),
// so exact upstream field names are not pinned down — fields below are marked optional/unknown
// and the service resolves multiple common key variants defensively (see resolveField in
// purpleFabric.service.ts) instead of assuming one exact schema.

export interface PurpleFabricAccessTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
  [key: string]: unknown;
}

export interface PurpleFabricTokenCache {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface CreateConversationRequest {
  conversation_name: string;
  asset_version_id: string;
}

export interface CreateConversationResponse {
  conversation_id?: string;
  _id?: string;
  id?: string;
  conversation_name?: string;
  [key: string]: unknown;
}

export interface AddMessageRequest {
  conversation_id: string;
  query: string;
}

export interface StreamedMessageResult {
  messageId: string | null;
  responseText: string;
  raw: unknown[];
}

export interface GetMessageResponseResult {
  messageId: string;
  responseText: string;
  status: string | null;
  raw: unknown;
}

export interface ConversationDetailsResult {
  conversationIdFromAgent: string;
  raw: unknown;
}

export interface PurpleFabricHealth {
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
  checkedAt: string;
  message?: string;
}
