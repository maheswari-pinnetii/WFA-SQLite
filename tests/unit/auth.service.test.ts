import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../frontend/src/features/auth/services/auth.service';
import { authApi } from '../../frontend/src/api/endpoints/auth.api';
import { STORAGE_KEYS } from '../../frontend/src/shared/constants/constants';

vi.mock('../../frontend/src/api/endpoints/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    biometricLockLogin: vi.fn(),
    passkeyLoginOptions: vi.fn(),
    verifyPasskeyLogin: vi.fn(),
  }
}));

vi.mock('../../frontend/src/api/client', () => ({
  apiClient: {},
  setAccessToken: vi.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock sessionStorage and localStorage
    const mockStorage = () => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
      };
    };
    
    global.sessionStorage = mockStorage() as any;
    global.localStorage = mockStorage() as any;
  });

  describe('signup', () => {
    it('should call authApi.signup', async () => {
      const mockData = { email: 'test@example.com' };
      vi.mocked(authApi.signup).mockResolvedValueOnce({ id: '123' });
      const result = await authService.signup(mockData);
      expect(authApi.signup).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('login', () => {
    it('should persist session when login is successful', async () => {
      const mockResponse = {
        token: 'fake-token',
        user: { role: 'EMPLOYEE', department: 'IT', status: 'ACTIVE' }
      };
      vi.mocked(authApi.login).mockResolvedValueOnce(mockResponse);

      const result = await authService.login('test@example.com', 'password123');
      
      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123', undefined);
      expect(sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('fake-token');
      expect(result.user.role).toBe('EMPLOYEE');
    });

    it('should throw an error for invalid user session (bad role)', async () => {
      const mockResponse = {
        token: 'fake-token',
        user: { role: 'INVALID_ROLE' }
      };
      vi.mocked(authApi.login).mockResolvedValueOnce(mockResponse);

      await expect(authService.login('test@example.com', 'password123')).rejects.toThrow('Login returned an invalid user session.');
    });
    
    it('should return raw response if no token/user provided (e.g. MFA required)', async () => {
      const mockResponse = {
        mfaRequired: true
      };
      vi.mocked(authApi.login).mockResolvedValueOnce(mockResponse as any);

      const result = await authService.login('test@example.com', 'password123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('biometricLockLogin', () => {
    it('should persist session when biometric login is successful', async () => {
      const mockResponse = {
        token: 'bio-token',
        user: { role: 'MANAGER' }
      };
      vi.mocked(authApi.biometricLockLogin).mockResolvedValueOnce(mockResponse);

      const payload = { email: 'bio@example.com', authMethod: 'pin', pin: '1234' };
      const result = await authService.biometricLockLogin(payload);
      
      expect(authApi.biometricLockLogin).toHaveBeenCalledWith(payload);
      expect(sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('bio-token');
      expect(result.user.role).toBe('MANAGER');
    });
  });
});
