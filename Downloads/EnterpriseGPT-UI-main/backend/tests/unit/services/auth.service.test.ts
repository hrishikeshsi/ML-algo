import { Role } from '@prisma/client';
import { authService } from '../../../src/services/auth.service';
import { userRepository } from '../../../src/repositories/user.repository';
import { organizationRepository } from '../../../src/repositories/organization.repository';
import { refreshTokenRepository } from '../../../src/repositories/refreshToken.repository';
import { hashPassword } from '../../../src/utils/password';

jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/repositories/organization.repository');
jest.mock('../../../src/repositories/refreshToken.repository');
jest.mock('../../../src/repositories/passwordReset.repository');
jest.mock('../../../src/services/email.service');

const mockedUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockedOrgRepo = organizationRepository as jest.Mocked<typeof organizationRepository>;
const mockedRefreshRepo = refreshTokenRepository as jest.Mocked<typeof refreshTokenRepository>;

const baseUser = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@acme.com',
  role: Role.USER,
  organizationId: 'org-1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRefreshRepo.create.mockResolvedValue({} as never);
  });

  describe('register', () => {
    it('creates a new organization and user when organizationId is not supplied', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(null);
      mockedOrgRepo.create.mockResolvedValue({
        id: 'org-1',
        organizationName: 'Acme',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockedUserRepo.create.mockResolvedValue({ ...baseUser, passwordHash: 'hashed' });

      const result = await authService.register({
        name: 'Jane Doe',
        email: 'jane@acme.com',
        password: 'Password1',
        organizationName: 'Acme',
      });

      expect(mockedOrgRepo.create).toHaveBeenCalledWith('Acme');
      expect(result.user.email).toBe('jane@acme.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('rejects registration when the email is already registered', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: 'hashed' });

      await expect(
        authService.register({
          name: 'Jane Doe',
          email: 'jane@acme.com',
          password: 'Password1',
          organizationName: 'Acme',
        })
      ).rejects.toThrow('An account with this email already exists');

      expect(mockedOrgRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: 'nobody@acme.com', password: 'whatever' })).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('rejects an incorrect password', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: await hashPassword('CorrectPass1') });

      await expect(authService.login({ email: baseUser.email, password: 'WrongPass1' })).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('logs in successfully with correct credentials and issues a token pair', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue({ ...baseUser, passwordHash: await hashPassword('CorrectPass1') });

      const result = await authService.login({ email: baseUser.email, password: 'CorrectPass1' });

      expect(result.user.id).toBe(baseUser.id);
      expect(result.tokens.accessToken).toBeDefined();
      expect(mockedRefreshRepo.create).toHaveBeenCalledTimes(1);
    });

    it('rejects a deactivated user even with the correct password', async () => {
      mockedUserRepo.findByEmail.mockResolvedValue({
        ...baseUser,
        isActive: false,
        passwordHash: await hashPassword('CorrectPass1'),
      });

      await expect(authService.login({ email: baseUser.email, password: 'CorrectPass1' })).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });
});
