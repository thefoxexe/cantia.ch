import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Organization, OrgRole } from './types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  role: OrgRole | null;
  loading: boolean;
  refreshOrganization: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string, trade: string | null) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrganization = useCallback(async (userId: string) => {
    try {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role, organization_id, organizations(*)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (membership?.organizations) {
        setOrganization(membership.organizations as unknown as Organization);
        setRole(membership.role as OrgRole);
      } else {
        setOrganization(null);
        setRole(null);
      }
    } catch (err) {
      console.error('Failed to load organization', err);
      setOrganization(null);
      setRole(null);
    }
  }, []);

  const refreshOrganization = useCallback(async () => {
    if (session?.user) await loadOrganization(session.user.id);
  }, [session, loadOrganization]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        if (data.session?.user) await loadOrganization(data.session.user.id);
      })
      .catch((err) => {
        console.error('Failed to get session', err);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await loadOrganization(newSession.user.id);
      } else {
        setOrganization(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadOrganization]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const createOrganization = useCallback(
    async (name: string, trade: string | null) => {
      const { error } = await supabase.rpc('create_organization', { org_name: name, org_trade: trade });
      if (error) return { error: error.message };
      if (session?.user) await loadOrganization(session.user.id);
      return { error: null };
    },
    [session, loadOrganization],
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      organization,
      role,
      loading,
      refreshOrganization,
      signIn,
      signUp,
      signOut,
      createOrganization,
    }),
    [session, organization, role, loading, refreshOrganization, signIn, signUp, signOut, createOrganization],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
