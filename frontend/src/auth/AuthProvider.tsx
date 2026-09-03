import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Role } from '../security/roles/roles';
import { apiClient } from '../services/api';
import { User } from './types/auth.types';
import { Permission } from '../security/permissions/permissions';

export interface AuthContextType {
  user: User | null;         // The rich application user
  session: Session | null;   // The Supabase session
  loading: boolean;
  isLoading: boolean;        // alias for loading to satisfy older components
  isAuthenticated: boolean;
  role: Role;
  permissions: Permission[];
  logout: () => Promise<void>; // Alias for signOut
  signOut: () => Promise<void>;
  
  // Dummy stubs to stop TS errors for components we haven't rewritten yet
  login: (params: any) => Promise<any>;
  verifyMfa: (code: string) => Promise<any>;
  resendMfa: () => Promise<any>;
  setSession: (sessionData: any) => void;
  initializeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(Role.EMPLOYEE);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState(session);
      if (session?.user) {
        fetchAppProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionState(session);
      
      if (session?.user) {
        fetchAppProfile(session.user);
      } else {
        setAppUser(null);
        setRole(Role.EMPLOYEE);
        setPermissions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch the application profile (RBAC) from our backend using the Supabase ID
  const fetchAppProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // In reality, this would hit the backend. For now, since the backend might not have the mapping yet,
      // we can construct a dummy User object or fetch if it exists.
      const response = await apiClient.get(`/auth/profile`);
      if (response.data && response.data.user) {
        const fetchedUser = response.data.user;
        setAppUser(fetchedUser);
        setRole(fetchedUser.role as Role || Role.EMPLOYEE);
        setPermissions(fetchedUser.permissions || []);
      } else {
        createFallbackUser(supabaseUser);
      }
    } catch (error) {
      console.error('Failed to fetch app profile', error);
      createFallbackUser(supabaseUser);
    } finally {
      setLoading(false);
    }
  };

  const createFallbackUser = (supabaseUser: SupabaseUser) => {
    // A fallback rich user to satisfy the frontend if the backend fails or mapping isn't done yet
    const fallbackUser: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Unknown User',
      email: supabaseUser.email || '',
      role: Role.EMPLOYEE,
      department: 'General',
      title: 'Employee',
      status: 'ACTIVE',
      permissions: []
    };
    setAppUser(fallbackUser);
    setRole(Role.EMPLOYEE);
    setPermissions([]);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const dummyFunc = async () => {};

  return (
    <AuthContext.Provider value={{
      user: appUser,
      session,
      loading,
      isLoading: loading,
      isAuthenticated: !!session,
      role,
      permissions,
      logout: signOut,
      signOut,
      login: dummyFunc,
      verifyMfa: dummyFunc,
      resendMfa: dummyFunc,
      setSession: dummyFunc,
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
