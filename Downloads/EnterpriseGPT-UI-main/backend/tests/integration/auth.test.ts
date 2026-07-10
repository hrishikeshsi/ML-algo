import request from 'supertest';
import { Role } from '@prisma/client';
import { createApp } from '../../src/app';
import { userRepository } from '../../src/repositories/user.repository';
import { organizationRepository } from '../../src/repositories/organization.repository';
import { refreshTokenRepository } from '../../src/repositories/refreshToken.repository';
import { apiLogRepository } from '../../src/repositories/apiLog.repository';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/organization.repository');
jest.mock('../../src/repositories/refreshToken.repository');
jest.mock('../../src/repositories/passwordReset.repository');
jest.mock('../../src/services/email.service');
jest.mock('../../src/repositories/apiLog.repository');

const app = createApp();

const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockedOrgRepo = organizationRepository as jest.Mocked<typeof organizationRepository>;
const mockedRefreshRepo = refreshTokenRepository as jest.Mocked<typeof refreshTokenRepository>;
const mockedApiLogRepo = apiLogRepository as jest.Mocked<typeof apiLogRepository>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiLogRepo.create.mockResolvedValue({} as never);
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user and returns a token pair', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(null);
      mockedOrgRepo.create.mockResolvedValue({
        id: 'org-1',
        organizationName: 'Acme',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedUserRepo.create.mockResolvedValue({
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@acme.com',
        passwordHash: 'hashed',
        role: Role.USER,
        organizationId: 'org-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedRefreshRepo.create.mockResolvedValue({} as never);

      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@acme.com',
        password: 'Password1',
        organizationName: 'Acme',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('jane@acme.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('rejects a request with a weak password', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@acme.com',
        password: 'weak',
        organizationName: 'Acme',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('rejects a request missing both organizationId and organizationName', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@acme.com',
        password: 'Password1',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('rejects requests without an access token', async () => {
      const response = await request(app).get('/api/v1/users/me');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
