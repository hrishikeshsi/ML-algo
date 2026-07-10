import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/utils/jwt';
import { conversationRepository } from '../../src/repositories/conversation.repository';
import { messageRepository } from '../../src/repositories/message.repository';
import { apiLogRepository } from '../../src/repositories/apiLog.repository';
import { purpleFabricService } from '../../src/services/purpleFabric.service';

jest.mock('../../src/repositories/conversation.repository');
jest.mock('../../src/repositories/message.repository');
jest.mock('../../src/repositories/apiLog.repository');
jest.mock('../../src/services/purpleFabric.service', () => ({
  purpleFabricService: {
    startConversation: jest.fn(),
    continueConversation: jest.fn(),
    sendMessage: jest.fn(),
    getMessageResponse: jest.fn(),
    getConversationDetails: jest.fn(),
    healthCheck: jest.fn(),
  },
}));

const app = createApp();

const mockedConversationRepo = conversationRepository as jest.Mocked<typeof conversationRepository>;
const mockedMessageRepo = messageRepository as jest.Mocked<typeof messageRepository>;
const mockedApiLogRepo = apiLogRepository as jest.Mocked<typeof apiLogRepository>;
const mockedPurpleFabric = purpleFabricService as jest.Mocked<typeof purpleFabricService>;

const token = signAccessToken({
  sub: 'user-1',
  email: 'jane@acme.com',
  role: Role.USER,
  organizationId: 'org-1',
});

function makeConversation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'conv-1',
    userId: 'user-1',
    title: 'Hello',
    conversationIdFromAgent: 'agent-conv-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as never;
}

describe('POST /api/v1/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiLogRepo.create.mockResolvedValue({} as never);
  });

  it('rejects requests without a valid access token', async () => {
    const response = await request(app).post('/api/v1/chat').send({ message: 'Hello' });
    expect(response.status).toBe(401);
  });

  it('creates a conversation, calls the Purple Fabric agent, and persists both messages', async () => {
    mockedConversationRepo.create.mockResolvedValue(makeConversation({ conversationIdFromAgent: null }));
    mockedPurpleFabric.startConversation.mockResolvedValue({ conversationIdFromAgent: 'agent-conv-1', raw: {} });
    mockedConversationRepo.setAgentConversationId.mockResolvedValue(makeConversation());
    mockedConversationRepo.findById.mockResolvedValue(makeConversation());
    mockedConversationRepo.touch.mockResolvedValue(makeConversation());

    mockedMessageRepo.create
      .mockResolvedValueOnce({
        id: 'msg-user',
        conversationId: 'conv-1',
        sender: 'USER',
        message: 'Hello',
        messageIdFromAgent: null,
        timestamp: new Date(),
      } as never)
      .mockResolvedValueOnce({
        id: 'msg-agent',
        conversationId: 'conv-1',
        sender: 'AGENT',
        message: 'Hi there, how can I help?',
        messageIdFromAgent: 'agent-msg-1',
        timestamp: new Date(),
      } as never);

    mockedPurpleFabric.continueConversation.mockResolvedValue({
      messageId: 'agent-msg-1',
      responseText: 'Hi there, how can I help?',
      raw: [],
    });

    const response = await request(app)
      .post('/api/v1/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Hello' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.agentMessage.message).toBe('Hi there, how can I help?');
    expect(response.body.data.conversation.conversationIdFromAgent).toBe('agent-conv-1');
    expect(mockedPurpleFabric.continueConversation).toHaveBeenCalledWith('agent-conv-1', 'Hello');
  });

  it('returns 404 when conversationId does not belong to the caller', async () => {
    mockedConversationRepo.findByIdForUser.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ conversationId: '11111111-1111-1111-1111-111111111111', message: 'Hello again' });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
