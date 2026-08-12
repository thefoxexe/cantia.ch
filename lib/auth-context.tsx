import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Organization, OrgRole } from './types';

// Required for web only: lets the popup opened by signInWithGoogle() close
// itself and hand the session back to the tab that opened it, once Google's
// redirect lands back on our own page.
WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  role: OrgRole | null;
  // Whether the signed-in member can see devis/factures — always true for
  // owner/admin, opt-in per member otherwise (see équipe screen). Derived
  // from the role itself, not just the raw DB flag, so a stale/missing
  // can_view_finances value on an admin/owner row can never lock them out.
  canViewFinances: boolean;
  loading: boolean;
  refreshOrganization: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string, trade: string | null) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [canViewFinances, setCanViewFinances] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrganization = useCallback(async (userId: string) => {
    try {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role, can_view_finances, organization_id, organizations(*)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (membership?.organizations) {
        setOrganization(membership.organizations as unknown as Organization);
        setRole(membership.role as OrgRole);
        setCanViewFinances(membership.role !== 'member' || !!membership.can_view_finances);
      } else {
        setOrganization(null);
        setRole(null);
        setCanViewFinances(false);
      }
    } catch (err) {
      console.error('Failed to load organization', err);
      setOrganization(null);
      setRole(null);
      setCanViewFinances(false);
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
        setCanViewFinances(false);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadOrganization]);

  // "Online" presence for the équipe screen/dashboard: bumps last_seen_at
  // every 60s while signed in and foregrounded. AppState.currentState works
  // on web too (react-native-web maps it to document.visibilitychange), so
  // this doesn't need a separate branch per platform.
  useEffect(() => {
    if (!session?.user) return;
    const beat = () => {
      supabase.rpc('touch_presence').then(() => {}, () => {});
    };
    beat();
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') beat();
    }, 60000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') beat();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [session?.user?.id]);

  // Refreshes organization/role on foreground — otherwise a change made by
  // someone else (e.g. being promoted to admin, or removed from the org)
  // only appears after a full sign-out/sign-in, since loadOrganization
  // above only runs once at mount and on auth events, never in response to
  // another user's write. Rate-limited so switching tabs/apps repeatedly
  // doesn't refetch on every single foreground.
  useEffect(() => {
    if (!session?.user) return;
    let lastRefresh = Date.now();
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const now = Date.now();
      if (now - lastRefresh < 30000) return;
      lastRefresh = now;
      loadOrganization(session.user.id);
    });
    return () => sub.remove();
  }, [session?.user?.id, loadOrganization]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    return { error: error?.message ?? null };
  }, []);

  // Web: a plain full-page redirect (Supabase's own default behavior when
  // skipBrowserRedirect isn't set) — no popup, so no risk of mobile Safari/
  // Chrome blocking a window.open() call, and the returning page picks the
  // session straight out of the URL since detectSessionInUrl is enabled.
  //
  // Native: skipBrowserRedirect gets us the auth URL without any redirect
  // happening, WebBrowser.openAuthSessionAsync opens it as an in-app browser
  // sheet and waits for Google to bounce back to our own `cantia://` scheme,
  // and the tokens are pulled out of that return URL by hand since native
  // has no "current page" for Supabase to auto-detect a session from.
  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      return { error: error?.message ?? null };
    }

    const redirectTo = Linking.createURL('auth-callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return { error: error?.message ?? 'Impossible de démarrer la connexion Google.' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { error: null };

    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) return { error: errorCode };
    const { access_token, refresh_token } = params;
    if (!access_token || !refresh_token) return { error: 'Connexion Google incomplète.' };

    const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
    return { error: sessionError?.message ?? null };
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
      canViewFinances,
      loading,
      refreshOrganization,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      createOrganization,
    }),
    [
      session,
      organization,
      role,
      canViewFinances,
      loading,
      refreshOrganization,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      createOrganization,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
