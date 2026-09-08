import { authApi } from '../../api/endpoints/auth.api';
import { STORAGE_KEYS } from '../../shared/constants/constants';
import { apiClient, setAccessToken } from '../../services/api';
import { Role } from '../../security/roles/roles';

const base64UrlToBuffer = (value: string): ArrayBuffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const bytes = atob(padded);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0)).buffer;
};

const bufferToBase64Url = (value: ArrayBuffer): string => {
  const bytes = new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const normalizeUser = (value: any) => {
  if (!value || typeof value !== 'object') return null;
  const knownRoles = Object.values(Role) as string[];
  const normalizedRole = typeof value.role === 'string' ? value.role.toUpperCase() : '';
  if (!knownRoles.includes(normalizedRole)) return null;
  return {
    ...value,
    role: normalizedRole,
    permissions: Array.isArray(value.permissions) ? value.permissions : [],
    department: value.department || '',
    team: value.team || '',
    title: value.title || '',
    status: value.status || 'ACTIVE'
  };
};

const persistSession = (response: any) => {
  if (!response?.token || !response?.user) throw new Error('Authentication returned an invalid user session.');
  const user = normalizeUser(response.user);
  if (!user) throw new Error('Authentication returned an invalid user session.');
  setAccessToken(response.token);
  sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
  return { ...response, user };
};

export const authService = {
  signup: async (signupData: any) => {
    return await authApi.signup(signupData);
  },

  login: async (email: string, password?: string, mfaMethod?: string) => {
    const response = await authApi.login(email, password, mfaMethod);
    if (response && (response as any).token && (response as any).user) {
      const user = normalizeUser((response as any).user);
      if (!user) throw new Error('Login returned an invalid user session.');
      const token = (response as any).token;
      setAccessToken(token);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return { ...(response as any), user };
    }
    return response;
  },

  biometricLockLogin: async (payload: {
    email: string;
    authMethod: string;
    pin?: string;
    pattern?: number[];
    deviceFingerprint?: string;
    deviceName?: string;
    saveTrustedDevice?: boolean;
  }) => {
    const response = await authApi.biometricLockLogin(payload);
    if (response && response.token && response.user) {
      const user = normalizeUser(response.user);
      if (!user) throw new Error('Biometric authentication returned an invalid user session.');
      const token = response.token;
      setAccessToken(token);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return { ...response, user };
    }
    return response;
  },

  passkeyLogin: async (email?: string) => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential || !navigator.credentials) {
      throw new Error('Passkeys are not supported by this browser.');
    }
    const optionsResponse = await authApi.passkeyLoginOptions(email);
    const publicKey: PublicKeyCredentialRequestOptions = {
      ...optionsResponse.options,
      challenge: base64UrlToBuffer(optionsResponse.options.challenge),
      allowCredentials: optionsResponse.options.allowCredentials?.map((credential: any) => ({
        ...credential,
        id: base64UrlToBuffer(credential.id),
      })),
    };
    const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey sign-in was cancelled.');
    const response = credential.response as AuthenticatorAssertionResponse;
    return persistSession(await authApi.passkeyLoginVerify(email || '', {
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        authenticatorData: bufferToBase64Url(response.authenticatorData),
        signature: bufferToBase64Url(response.signature),
        userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
      },
    }));
  },

  registerPasskey: async (email: string, fullName: string) => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential || !navigator.credentials) {
      throw new Error('Passkeys are not supported by this browser.');
    }
    const optionsResponse = await authApi.passkeyRegisterOptions(email, fullName);
    const publicKey: PublicKeyCredentialCreationOptions = {
      ...optionsResponse.options,
      challenge: base64UrlToBuffer(optionsResponse.options.challenge),
      user: { ...optionsResponse.options.user, id: base64UrlToBuffer(optionsResponse.options.user.id) },
    };
    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey registration was cancelled.');
    const response = credential.response as AuthenticatorAttestationResponse;
    return persistSession(await authApi.passkeyRegisterVerify(email, fullName, {
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        attestationObject: bufferToBase64Url(response.attestationObject),
        transports: response.getTransports?.() || [],
      },
    }));
  },

  verifyMfa: async (challengeId: string, code: string) => {
    const data = await authApi.verifyMfa(challengeId, code);
    const { token, user, recoveryCodes } = data;
    const normalizedUser = normalizeUser(user);
    if (!token || !normalizedUser) throw new Error('MFA returned an invalid user session.');
    setAccessToken(token);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return { token, user: normalizedUser, recoveryCodes };
  },

  resendMfa: async (challengeId: string, mfaMethod?: string) => {
    return await authApi.resendMfa(challengeId, mfaMethod);
  },

  refreshSilent: async () => {
    const response = await apiClient.post('/v1/auth/refresh');
    if (response.data && response.data.success && response.data.data?.token) {
      const { token } = response.data.data;
      setAccessToken(token);
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return { token };
    }
    throw new Error('Failed to refresh session');
  },

  getGoogleLoginUrl: async () => {
    return await authApi.getGoogleLoginUrl();
  },

  getMicrosoftLoginUrl: async () => {
    return await authApi.getMicrosoftLoginUrl();
  },

  ssoCallback: async (code: string, state: string, provider: string) => {
    const data = await authApi.ssoCallback(code, state, provider);
    
    // Check if it requires MFA redirection challenge
    if (data.data && data.data.requiresMfa) {
      return data.data; // Return the MFA challenge instructions
    }

    const { token, user } = data.data;
    const normalizedUser = normalizeUser(user);
    if (!token || !normalizedUser) throw new Error('SSO returned an invalid user session.');
    setAccessToken(token);
    sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalizedUser));
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return { token, user: normalizedUser };
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    setAccessToken(null);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Sign out from ALL active sessions across all devices.
   */
  logoutAll: async () => {
    try {
      await apiClient.post('/v1/auth/logout-all');
    } catch (err) {
      console.error('Logout-all request failed:', err);
    }
    setAccessToken(null);
    sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Request a password reset email.
   * Returns same generic message regardless of account existence.
   */
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/v1/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Submit a new password using the reset token from the email link.
   * Token is read from the URL — NEVER from localStorage.
   */
  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/v1/auth/reset-password', { token, password });
    return response.data;
  },

  /**
   * Change password for authenticated user. Requires current password.
   * All active sessions are invalidated after success.
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/v1/auth/change-password', { currentPassword, newPassword });
    if (response.data?.success) {
      // Clear local session — user must re-authenticate
      setAccessToken(null);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return response.data;
  },

  /**
   * Send an email verification link to the authenticated user's email.
   */
  sendVerification: async () => {
    const response = await apiClient.post('/v1/auth/send-verification');
    return response.data;
  },

  /**
   * Verify an email address using the token from the verification email link.
   */
  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/v1/auth/verify-email', { token });
    return response.data;
  },

  getStoredSession: () => {
    const userData = sessionStorage.getItem(STORAGE_KEYS.USER_DATA) || localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    if (userData) {
      try {
        const user = normalizeUser(JSON.parse(userData));
        if (!user) return null;
        const validToken = token || `stored-token-${user.id}`;
        setAccessToken(validToken);
        return {
          user,
          token: validToken
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  setStoredSession: (session: { user: any; token?: string }) => {
    if (session.user) {
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user));
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(session.user));
    }
    if (session.token) {
      setAccessToken(session.token);
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.token);
    }
  }
};

