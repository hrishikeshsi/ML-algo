import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/appError';
import { consumeSseStream } from '../utils/sse';
import {
  AddMessageRequest,
  ConversationDetailsResult,
  CreateConversationRequest,
  CreateConversationResponse,
  GetMessageResponseResult,
  PurpleFabricAccessTokenResponse,
  PurpleFabricHealth,
  PurpleFabricTokenCache,
  StreamedMessageResult,
} from '../interfaces/purple-fabric.interface';

function resolveField(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return null;
}

function tryParseJson(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Secure middleware to the Purple Fabric / Intellect Magic Platform GenAI agent.
 * Owns the only copy of the Purple Fabric credentials (read from process env) —
 * the frontend never sees an apikey, access token, or refresh token.
 */
export class PurpleFabricService {
  private readonly http: AxiosInstance;
  private tokenCache: PurpleFabricTokenCache | null = null;
  private tokenPromise: Promise<string> | null = null;

  constructor() {
    this.http = axios.create({
      baseURL: env.purpleFabric.endpoint,
      timeout: env.purpleFabric.timeoutMs,
      validateStatus: () => true,
    });
  }

  private get conversationBasePath(): string {
    return `/magicplatform/${env.purpleFabric.apiVersion}/genai/conversation`;
  }

  private buildAuthHeaders(accessToken: string, refreshToken?: string): Record<string, string> {
    const headers: Record<string, string> = {
      apikey: env.purpleFabric.apiKey,
      authorization: `Bearer ${accessToken}`,
      'x-platform-workspaceid': env.purpleFabric.workspaceId,
    };
    if (refreshToken) headers.refreshtoken = refreshToken;
    return headers;
  }

  private async fetchAccessToken(): Promise<PurpleFabricTokenCache> {
    const response = await this.http.get<PurpleFabricAccessTokenResponse>(
      `/accesstoken/${env.purpleFabric.tenant}`,
      {
        headers: {
          apikey: env.purpleFabric.apiKey,
          username: env.purpleFabric.username,
          password: env.purpleFabric.password,
        },
      }
    );

    if (response.status >= 400 || !response.data?.access_token) {
      logger.error('Purple Fabric access token request failed', {
        status: response.status,
        data: response.data,
      });
      throw AppError.badGateway('Unable to authenticate with the Purple Fabric agent');
    }

    const { access_token, refresh_token, expires_in } = response.data;
    const ttlMs = (expires_in ?? 300) * 1000;

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + ttlMs - env.purpleFabric.tokenRefreshBufferMs,
    };
  }

  /** Returns a cached, valid access token — refetching (single-flight) when missing or near expiry. */
  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.accessToken;
    }

    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchAccessToken()
        .then((cache) => {
          this.tokenCache = cache;
          return cache.accessToken;
        })
        .finally(() => {
          this.tokenPromise = null;
        });
    }

    return this.tokenPromise;
  }

  async startConversation(conversationName: string): Promise<{ conversationIdFromAgent: string; raw: unknown }> {
    const accessToken = await this.getAccessToken();
    const body: CreateConversationRequest = {
      conversation_name: conversationName,
      asset_version_id: env.purpleFabric.assetVersionId,
    };

    const response = await this.http.post<CreateConversationResponse>(`${this.conversationBasePath}/create`, body, {
      headers: { ...this.buildAuthHeaders(accessToken), 'content-type': 'application/json' },
    });

    if (response.status >= 400) {
      logger.error('Purple Fabric create conversation failed', { status: response.status, data: response.data });
      throw AppError.badGateway('Unable to start a conversation with the Purple Fabric agent');
    }

    const conversationIdFromAgent = resolveField(response.data ?? {}, ['conversation_id', '_id', 'id']);

    if (!conversationIdFromAgent) {
      logger.error('Purple Fabric create conversation returned no recognizable conversation id', {
        data: response.data,
      });
      throw AppError.badGateway('Purple Fabric agent did not return a conversation id');
    }

    return { conversationIdFromAgent, raw: response.data };
  }

  /**
   * Sends a message on an existing agent conversation, consumes the SSE stream for the live
   * token deltas, then — if the stream surfaces a message id — briefly polls the
   * response/{conversationId}/{messageId} endpoint for the authoritative persisted answer,
   * falling back to the streamed text if polling doesn't resolve in time.
   */
  async sendMessage(conversationIdFromAgent: string, query: string): Promise<StreamedMessageResult> {
    const accessToken = await this.getAccessToken();
    const body: AddMessageRequest = { conversation_id: conversationIdFromAgent, query };

    const response = await this.http.post(`${this.conversationBasePath}/addmessage/stream`, body, {
      headers: {
        ...this.buildAuthHeaders(accessToken),
        'content-type': 'application/json',
        accept: 'text/event-stream',
      },
      responseType: 'stream',
    });

    if (response.status >= 400) {
      const errorBody = await this.drainErrorStream(response.data as Readable);
      logger.error('Purple Fabric addmessage/stream failed', { status: response.status, data: errorBody });
      throw AppError.badGateway('Unable to send message to the Purple Fabric agent');
    }

    let messageId: string | null = null;
    let responseText = '';
    const raw: unknown[] = [];

    await consumeSseStream(response.data as Readable, (data) => {
      if (data === '[DONE]') return;
      raw.push(data);
      const parsed = tryParseJson(data);

      if (parsed) {
        const id = resolveField(parsed, ['message_id', 'messageId', 'id']);
        if (id) messageId = id;

        const fragment = resolveField(parsed, ['content', 'delta', 'token', 'answer', 'response', 'message']);
        if (fragment) responseText += fragment;
      } else {
        responseText += data;
      }
    });

    if (messageId) {
      const polled = await this.pollMessageResponse(conversationIdFromAgent, messageId);
      if (polled?.responseText) {
        return { messageId, responseText: polled.responseText, raw };
      }
    }

    return { messageId, responseText: responseText.trim(), raw };
  }

  /** Continuing a conversation uses the exact same upstream call as sending the first message. */
  async continueConversation(conversationIdFromAgent: string, query: string): Promise<StreamedMessageResult> {
    return this.sendMessage(conversationIdFromAgent, query);
  }

  async getMessageResponse(conversationIdFromAgent: string, messageId: string): Promise<GetMessageResponseResult> {
    const accessToken = await this.getAccessToken();
    const response = await this.http.get(
      `${this.conversationBasePath}/response/${conversationIdFromAgent}/${messageId}`,
      { headers: this.buildAuthHeaders(accessToken, this.tokenCache?.refreshToken) }
    );

    if (response.status >= 400) {
      throw AppError.badGateway('Unable to retrieve message response from the Purple Fabric agent');
    }

    const data = (response.data ?? {}) as Record<string, unknown>;
    const responseText = resolveField(data, ['response', 'answer', 'message', 'content', 'text']) ?? '';
    const status = resolveField(data, ['status', 'state']);

    return { messageId, responseText, status, raw: response.data };
  }

  private async pollMessageResponse(
    conversationIdFromAgent: string,
    messageId: string
  ): Promise<GetMessageResponseResult | null> {
    for (let attempt = 0; attempt < env.purpleFabric.pollMaxAttempts; attempt += 1) {
      try {
        const result = await this.getMessageResponse(conversationIdFromAgent, messageId);
        const status = result.status?.toLowerCase();
        const isPending = status === 'pending' || status === 'processing' || status === 'in_progress';

        if (result.responseText && !isPending) {
          return result;
        }
      } catch (error) {
        logger.warn('Polling Purple Fabric message response failed, will retry', {
          conversationIdFromAgent,
          messageId,
          attempt,
          error: error instanceof Error ? error.message : error,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, env.purpleFabric.pollIntervalMs));
    }

    return null;
  }

  async getConversationDetails(conversationIdFromAgent: string): Promise<ConversationDetailsResult> {
    const accessToken = await this.getAccessToken();
    const response = await this.http.get(`${this.conversationBasePath}/details/${conversationIdFromAgent}`, {
      headers: this.buildAuthHeaders(accessToken, this.tokenCache?.refreshToken),
    });

    if (response.status >= 400) {
      throw AppError.badGateway('Unable to retrieve conversation details from the Purple Fabric agent');
    }

    return { conversationIdFromAgent, raw: response.data };
  }

  async healthCheck(): Promise<PurpleFabricHealth> {
    const startedAt = Date.now();

    try {
      await this.getAccessToken();
      return { status: 'ok', latencyMs: Date.now() - startedAt, checkedAt: new Date().toISOString() };
    } catch (error) {
      logger.error('Purple Fabric health check failed', { error: error instanceof Error ? error.message : error });
      return {
        status: 'down',
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async drainErrorStream(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
  }
}

export const purpleFabricService = new PurpleFabricService();
