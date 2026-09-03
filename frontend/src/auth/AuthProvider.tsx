import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '../security/roles/roles';
import { User } from './types/auth.types';
import { Permission } from '../security/permissions/permissions';
import { authService } from './services/auth.service';

export interface AuthContextType {
  user: User | null;         // The rich application user
  session: any;
  loading: boolean;
  isLoading: boolean;        // alias for loading to satisfy older components
  isAuthenticated: boolean;
  role: Role;
  permissions: Permission[];
  logout: () => Promise<void>; // Alias for signOut
  signOut: () => Promise<void>;
  
  // Dummy stubs to stop TS errors for components we haven't rewritten yet
  login: (email: string, password: string) => Promise<any>;
  signup: (params: any) => Promise<any>;
  verifyMfa: (code: string) => Promise<any>;
  resendMfa: () => Promise<any>;
  setSession: (sessionData: any) => void;
  initializeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<any>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(Role.EMPLOYEE);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const storedSession = authService.getStoredSession();
    if (storedSession) {
      setSessionState(storedSession);
      setAppUser(storedSession.user as User);
      setRole(storedSession.user.role as Role);
      setPermissions((storedSession.user.permissions || []) as Permission[]);
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    await authService.logout();
    setSessionState(null);
    setAppUser(null);
    setRole(Role.EMPLOYEE);
    setPermissions([]);
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    const nextSession = { user: result.user, token: result.token };
    setSessionState(nextSession);
    setAppUser(result.user);
    setRole(result.user.role as Role);
    setPermissions(result.user.permissions as Permission[]);
    return result;
  };

  const signup = async (params: any) => authService.signup(params);

  const setSession = (sessionData: any) => {
    if (!sessionData?.user) return;
    setSessionState(sessionData);
    setAppUser(sessionData.user);
    setRole(sessionData.user.role as Role);
    setPermissions(sessionData.user.permissions || []);
  };

  return (
    <AuthContext.Provider value={{
      user: appUser,
      session,
      loading,
      isLoading: loading,
      isAuthenticated: !!session && !!appUser,
      role,
      permissions,
      logout: signOut,
      signOut,
      login,
      signup,
      verifyMfa: async () => undefined,
      resendMfa: async () => undefined,
      setSession,
      initializeAuth: () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
