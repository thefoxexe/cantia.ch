import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { isPlatformAdmin as checkIsPlatformAdmin } from './api/admin';
import { applyLocaleFromUrlParam, AVAILABLE_LOCALES, getAppLocale, restoreCachedLocale, setAppLocale, type AppLocale } from './translations';
import type { Organization, OrgRole } from './types';

// Required for web only: lets the popup opened by signInWithGoogle() close
// itself and hand the session back to the tab that opened it, once Google's
// redirect lands back on our own page.
WebBrowser.maybeCompleteAuthSession();

// Everything besides Finance defaults to granted for a member with no
// custom role assigned — assigning one and only touching, say, the Finance
// checkbox shouldn't silently strip access to Métré/Planning/Documents the
// member already had. Finance is the one opt-in-only permission (see équipe
// screen and 20260812130000's rationale).
interface RolePermissions {
  metre: boolean;
  planning: boolean;
  documents: boolean;
  subcontractors: boolean;
}

const FULL_ACCESS: RolePermissions = { metre: true, planning: true, documents: true, subcontractors: true };

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  role: OrgRole | null;
  // Whether the signed-in member can see devis/factures/rentabilité —
  // always true for owner/admin, opt-in per member otherwise (see équipe
  // screen). Derived from the role itself, not just the raw DB flag, so a
  // stale/missing can_view_finances value on an admin/owner row can never
  // lock them out.
  canViewFinances: boolean;
  // Same opt-in-only semantics as canViewFinances: always true for
  // owner/admin, granted per member via a custom role otherwise.
  canCreateProjects: boolean;
  canManagePayroll: boolean;
  permissions: RolePermissions;
  // Cantia's own platform role (super-admin panel), entirely separate from
  // org-level owner/admin — resolved server-side via is_platform_admin(),
  // never derived from anything in the organization/role payload above.
  isPlatformAdmin: boolean;
  loading: boolean;
  // Set once Supabase reports a PASSWORD_RECOVERY auth event (the user
  // followed the "mot de passe oublié" e-mail link) — the root layout's
  // redirect effect checks this to force them onto /(auth)/update-password
  // instead of wherever the session/organization state would otherwise
  // send them.
  isPasswordRecovery: boolean;
  refreshOrganization: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  // needsVerification is true when Supabase's "Confirm email" setting is on
  // and the account isn't confirmed yet — signUp() then returns no session
  // (nothing to sign in with) until verifySignupCode() succeeds.
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  verifySignupCode: (email: string, code: string) => Promise<{ error: string | null }>;
  resendSignupCode: (email: string) => Promise<{ error: string | null }>;
  // Updates organization_members.locale (the source of truth) for the
  // current user+org and switches the running app's language immediately.
  changeLocale: (locale: AppLocale) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithMicrosoft: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string, trade: string | null) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);
  const [canViewFinances, setCanViewFinances] = useState(false);
  const [canCreateProjects, setCanCreateProjects] = useState(false);
  const [canManagePayroll, setCanManagePayroll] = useState(false);
  const [permissions, setPermissions] = useState<RolePermissions>(FULL_ACCESS);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const loadOrganization = useCallback(async (userId: string) => {
    try {
      const { data: membership } = await supabase
        .from('organization_members')
        .select(
          'role, role_id, organization_id, locale, organizations(*), organization_roles(can_view_finances, can_view_metre, can_view_planning, can_view_documents, can_view_subcontractors, can_create_projects, can_manage_payroll)',
        )
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (membership?.organizations) {
        setOrganization(membership.organizations as unknown as Organization);
        setRole(membership.role as OrgRole);
        // organization_members.locale is the source of truth — reconcile
        // it against whatever the AsyncStorage cache guessed at boot.
        const dbLocale = membership.locale as AppLocale | null;
        if (dbLocale && AVAILABLE_LOCALES.includes(dbLocale) && dbLocale !== getAppLocale()) {
          setAppLocale(dbLocale);
        }
        const assignedRole = membership.organization_roles as unknown as {
          can_view_finances: boolean;
          can_view_metre: boolean;
          can_view_planning: boolean;
          can_view_documents: boolean;
          can_view_subcontractors: boolean;
          can_create_projects: boolean;
          can_manage_payroll: boolean;
        } | null;
        const isStructuralAdmin = membership.role !== 'member';
        const hasNoCustomRole = !membership.role_id;
        setCanViewFinances(isStructuralAdmin || !!assignedRole?.can_view_finances);
        setCanCreateProjects(isStructuralAdmin || !!assignedRole?.can_create_projects);
        setCanManagePayroll(isStructuralAdmin || !!assignedRole?.can_manage_payroll);
        setPermissions(
          isStructuralAdmin || hasNoCustomRole
            ? FULL_ACCESS
            : {
                metre: !!assignedRole?.can_view_metre,
                planning: !!assignedRole?.can_view_planning,
                documents: !!assignedRole?.can_view_documents,
                subcontractors: !!assignedRole?.can_view_subcontractors,
              },
        );
      } else {
        setOrganization(null);
        setRole(null);
        setCanViewFinances(false);
        setCanCreateProjects(false);
        setCanManagePayroll(false);
        setPermissions(FULL_ACCESS);
      }
    } catch (err) {
      console.error('Failed to load organization', err);
      setOrganization(null);
      setRole(null);
      setCanViewFinances(false);
      setCanCreateProjects(false);
      setCanManagePayroll(false);
      setPermissions(FULL_ACCESS);
    }
  }, []);

  const refreshOrganization = useCallback(async () => {
    if (session?.user) await loadOrganization(session.user.id);
  }, [session, loadOrganization]);

  // Fire-and-forget: gets the app into the right language immediately on a
  // repeat visit, before the session/org round-trip below even resolves.
  // loadOrganization() reconciles it against organization_members.locale
  // (the real source of truth) once that lands. applyLocaleFromUrlParam runs
  // after, so an explicit ?locale=de carried over from the marketing site
  // (see lib/appHost.ts's authHref) wins over a stale cached guess.
  useEffect(() => {
    restoreCachedLocale().then(applyLocaleFromUrlParam);
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        if (data.session?.user) {
          await Promise.all([loadOrganization(data.session.user.id), checkIsPlatformAdmin().then(setIsPlatformAdmin)]);
        }
      })
      .catch((err) => {
        console.error('Failed to get session', err);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (_event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      setSession(newSession);
      if (newSession?.user) {
        await Promise.all([loadOrganization(newSession.user.id), checkIsPlatformAdmin().then(setIsPlatformAdmin)]);
      } else {
        setOrganization(null);
        setRole(null);
        setCanViewFinances(false);
        setPermissions(FULL_ACCESS);
        setIsPlatformAdmin(false);
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
    // Whatever language the marketing site was showing when they signed up
    // (French by default, German on /de/... pages) — create_organization()
    // reads this back out of raw_user_meta_data and seeds
    // organization_members.locale with it, same mechanism as full_name.
    const locale = getAppLocale();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, locale } } });
    // Supabase returns a user with no session when "Confirm email" is
    // enabled and this account isn't confirmed yet — that's the only
    // reliable signal here, since the call itself still succeeds either way.
    return { error: error?.message ?? null, needsVerification: !error && !data.session };
  }, []);

  const changeLocale = useCallback(
    async (locale: AppLocale) => {
      await setAppLocale(locale);
      if (!session?.user || !organization) return { error: null };
      const { error } = await supabase
        .from('organization_members')
        .update({ locale })
        .eq('organization_id', organization.id)
        .eq('user_id', session.user.id);
      return { error: error?.message ?? null };
    },
    [session, organization],
  );

  const verifySignupCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    return { error: error?.message ?? null };
  }, []);

  const resendSignupCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error: error?.message ?? null };
  }, []);

  // Web: a plain full-page redirect (Supabase's own default behavior when
  // skipBrowserRedirect isn't set) — no popup, so no risk of mobile Safari/
  // Chrome blocking a window.open() call, and the returning page picks the
  // session straight out of the URL since detectSessionInUrl is enabled.
  //
  // Native: skipBrowserRedirect gets us the auth URL without any redirect
  // happening, WebBrowser.openAuthSessionAsync opens it as an in-app browser
  // sheet and waits for the provider to bounce back to our own `cantia://`
  // scheme, and the tokens are pulled out of that return URL by hand since
  // native has no "current page" for Supabase to auto-detect a session from.
  // Shared by Google and Microsoft — same dance either way, only the
  // provider id and the generic error message differ.
  const signInWithOAuthProvider = useCallback(async (provider: 'google' | 'azure', providerLabel: string) => {
    if (Platform.OS === 'web') {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
      return { error: error?.message ?? null };
    }

    const redirectTo = Linking.createURL('auth-callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return { error: error?.message ?? `Impossible de démarrer la connexion ${providerLabel}.` };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { error: null };

    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) return { error: errorCode };
    const { access_token, refresh_token } = params;
    if (!access_token || !refresh_token) return { error: `Connexion ${providerLabel} incomplète.` };

    const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
    return { error: sessionError?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(() => signInWithOAuthProvider('google', 'Google'), [signInWithOAuthProvider]);
  // Supabase's built-in provider id for Microsoft Entra ID (formerly Azure
  // AD) is 'azure' — set up in Supabase Dashboard > Authentication >
  // Providers > Azure, using an app registration created in the Azure
  // Portal.
  const signInWithMicrosoft = useCallback(() => signInWithOAuthProvider('azure', 'Microsoft'), [signInWithOAuthProvider]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Web: redirect back to the app's own origin — the recovery link lands
  // there with the token in the URL, detectSessionInUrl picks it up, and
  // the PASSWORD_RECOVERY event above sends them to update-password.
  // Native: same idea via the cantia:// deep link scheme.
  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = Platform.OS === 'web' ? (typeof window !== 'undefined' ? window.location.origin : undefined) : Linking.createURL('/');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) setIsPasswordRecovery(false);
    return { error: error?.message ?? null };
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
      canCreateProjects,
      canManagePayroll,
      permissions,
      isPlatformAdmin,
      loading,
      isPasswordRecovery,
      refreshOrganization,
      signIn,
      signUp,
      verifySignupCode,
      resendSignupCode,
      changeLocale,
      signInWithGoogle,
      signInWithMicrosoft,
      signOut,
      createOrganization,
      resetPassword,
      updatePassword,
    }),
    [
      session,
      organization,
      role,
      canViewFinances,
      canCreateProjects,
      canManagePayroll,
      permissions,
      isPlatformAdmin,
      loading,
      isPasswordRecovery,
      refreshOrganization,
      signIn,
      signUp,
      verifySignupCode,
      resendSignupCode,
      changeLocale,
      signInWithGoogle,
      signInWithMicrosoft,
      signOut,
      createOrganization,
      resetPassword,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
