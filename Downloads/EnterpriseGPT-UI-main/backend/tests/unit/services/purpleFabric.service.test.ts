import axios from 'axios';
import { PurpleFabricService } from '../../../src/services/purpleFabric.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockHttp = { get: jest.fn(), post: jest.fn() };

describe('PurpleFabricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockHttp as unknown as ReturnType<typeof axios.create>);
  });

  it('fetches an access token once and reuses it across calls', async () => {
    mockHttp.get.mockResolvedValueOnce({
      status: 200,
      data: { access_token: 'token-1', refresh_token: 'refresh-1', expires_in: 300 },
    });
    mockHttp.post
      .mockResolvedValueOnce({ status: 200, data: { conversation_id: 'conv-123' } })
      .mockResolvedValueOnce({ status: 200, data: { conversation_id: 'conv-456' } });

    const service = new PurpleFabricService();

    const first = await service.startConversation('First conversation');
    expect(first.conversationIdFromAgent).toBe('conv-123');

    const second = await service.startConversation('Second conversation');
    expect(second.conversationIdFromAgent).toBe('conv-456');

    // access token endpoint should only be hit once thanks to in-memory caching
    expect(mockHttp.get).toHaveBeenCalledTimes(1);
    expect(mockHttp.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/conversation/create'),
      expect.objectContaining({ conversation_name: 'First conversation' }),
      expect.any(Object)
    );
  });

  it('throws when the agent does not return a recognizable conversation id', async () => {
    mockHttp.get.mockResolvedValueOnce({
      status: 200,
      data: { access_token: 'token-1', refresh_token: 'refresh-1', expires_in: 300 },
    });
    mockHttp.post.mockResolvedValueOnce({ status: 200, data: {} });

    const service = new PurpleFabricService();

    await expect(service.startConversation('No id in response')).rejects.toThrow(
      'Purple Fabric agent did not return a conversation id'
    );
  });

  it('reports health as down when the access token request fails', async () => {
    mockHttp.get.mockResolvedValueOnce({ status: 401, data: { error: 'invalid credentials' } });

    const service = new PurpleFabricService();
    const health = await service.healthCheck();

    expect(health.status).toBe('down');
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('reports health as ok when the access token request succeeds', async () => {
    mockHttp.get.mockResolvedValueOnce({
      status: 200,
      data: { access_token: 'token-1', refresh_token: 'refresh-1', expires_in: 300 },
    });

    const service = new PurpleFabricService();
    const health = await service.healthCheck();

    expect(health.status).toBe('ok');
  });
});
