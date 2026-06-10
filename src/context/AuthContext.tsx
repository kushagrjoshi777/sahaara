// ============================================
// Sahaara — Auth Context
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, IS_MOCK_MODE } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const MOCK_STORAGE_KEY = 'sahaara.mock.session';

const getStoredMockSession = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(MOCK_STORAGE_KEY);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(MOCK_STORAGE_KEY);
  } catch {
    return null;
  }
};

const setStoredMockSession = async (sessionStr: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(MOCK_STORAGE_KEY, sessionStr);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(MOCK_STORAGE_KEY, sessionStr);
  } catch {
    // ignore
  }
};

const removeStoredMockSession = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(MOCK_STORAGE_KEY);
  } catch {
    // ignore
  }
};

const createMockSession = (email: string, fullName: string): Session => {
  const user = {
    id: 'mock-user-uuid',
    email,
    user_metadata: { full_name: fullName },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as any;

  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_MOCK_MODE) {
      const checkMockSession = async () => {
        try {
          const storedSession = await getStoredMockSession();
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            setSession(parsed.currentSession);
            setUser(parsed.currentSession?.user ?? null);
          }
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      };
      checkMockSession();
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Handle deep link for OAuth redirect (native only)
    if (Platform.OS !== 'web') {
      const subscription2 = Linking.addEventListener('url', ({ url }) => {
        const { params } = QueryParams.getQueryParams(url);
        const { access_token, refresh_token } = params;

        if (access_token) {
          supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          }).catch(console.error);
        }
      });

      return () => {
        subscription.unsubscribe();
        subscription2.remove();
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    if (IS_MOCK_MODE) {
      const mockSession = createMockSession(email, fullName);
      await setStoredMockSession(JSON.stringify({ currentSession: mockSession }));
      setSession(mockSession);
      setUser(mockSession.user);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'An unexpected error occurred' };
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    if (IS_MOCK_MODE) {
      const mockSession = createMockSession(email, email.split('@')[0]);
      await setStoredMockSession(JSON.stringify({ currentSession: mockSession }));
      setSession(mockSession);
      setUser(mockSession.user);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (IS_MOCK_MODE) {
      const mockSession = createMockSession('google-user@gmail.com', 'Google User');
      await setStoredMockSession(JSON.stringify({ currentSession: mockSession }));
      setSession(mockSession);
      setUser(mockSession.user);
      return { error: null };
    }

    try {
      // Ensure any in-progress auth session is completed (required for web)
      if (Platform.OS === 'web') {
        WebBrowser.maybeCompleteAuthSession();
      }

      // Generate redirect URI for deep linking
      const redirectUrl = makeRedirectUri();
      console.log('[AuthContext] signInWithGoogle redirectUrl', redirectUrl);

      // Get OAuth URL from Supabase (do not redirect automatically)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      console.log('[AuthContext] signInWithOAuth response', { data, error });

      if (error) return { error: error.message };
      if (!data?.url) return { error: 'No OAuth URL returned' };
      console.log('[AuthContext] signInWithGoogle OAuth URL', data.url);

      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      console.log('[AuthContext] openAuthSessionAsync result', result);

      // Handle OAuth result
      if (result.type === 'success' && result.url) {
        console.log('[AuthContext] openAuthSessionAsync returned url', result.url);

        // Extract tokens from redirect URL
        const { params, errorCode } = QueryParams.getQueryParams(result.url);
        console.log('[AuthContext] parsed OAuth redirect params', params, 'errorCode', errorCode);

        if (errorCode) {
          console.error('[AuthContext] signInWithGoogle OAuth errorCode', errorCode);
          return { error: errorCode };
        }

        const { access_token, refresh_token } = params;
        console.log('[AuthContext] signInWithGoogle tokens', { access_token, refresh_token });

        if (!access_token) {
          return { error: 'No access token received' };
        }

        // Manually set session with tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });
        console.log('[AuthContext] supabase.auth.setSession error', sessionError);

        const currentSession = await supabase.auth.getSession();
        console.log('[AuthContext] supabase.auth.getSession after setSession', currentSession);

        if (sessionError) {
          return { error: sessionError.message };
        }

        return { error: null };
      } else if (result.type === 'cancel') {
        return { error: 'Sign in cancelled' };
      } else if (result.type === 'dismiss') {
        return { error: 'Sign in dismissed' };
      }

      return { error: 'Unknown error during sign in' };
    } catch (e: any) {
      console.error('[AuthContext] signInWithGoogle catch', e);
      return { error: e.message || 'Google Sign-In failed' };
    }
  };

  const signOut = async () => {
    if (IS_MOCK_MODE) {
      await removeStoredMockSession();
      setSession(null);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
