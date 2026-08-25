import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';
import type { Plan } from './types';

export type ModuleKey = 'documents' | 'photos' | 'devis' | 'metre' | 'planning' | 'profitability' | 'subcontractors' | 'payroll' | 'treasury';

interface ModuleDef {
  key: ModuleKey;
  label: string;
  description: string;
}

// Org-wide: gate top-level sections of the main navigation (sidebar,
// dashboard), not tied to any single chantier.
export const ORG_MODULES: ModuleDef[] = [
  { key: 'devis', label: 'Devis', description: 'Création de devis et suivi de statut.' },
  { key: 'planning', label: 'Planning', description: "Qui va sur quel chantier, et quand." },
  { key: 'payroll', label: 'RH & Salaires', description: 'Heures, frais professionnels et fiches de salaire par employé.' },
  { key: 'treasury', label: 'Trésorerie', description: 'Projection de trésorerie sur 90 jours : factures, salaires, sous-traitants, dépenses récurrentes.' },
];

// Per-chantier: shown as a hub inside each chantier, toggled independently
// per project from ses paramètres (voir chantiers/[id]/settings.tsx) and
// choisis à la création du chantier.
export const PROJECT_MODULES: ModuleDef[] = [
  { key: 'documents', label: 'Documents', description: 'Classeur de dossiers et fichiers.' },
  { key: 'photos', label: 'Photos', description: 'Galerie photo filtrable, avec une carte des prises de vue.' },
  { key: 'metre', label: 'Métré', description: 'Tableau de quantités poste par poste.' },
  { key: 'subcontractors', label: 'Sous-traitants', description: "Entreprises sous-traitées, interventions et attestations d'assurance." },
  { key: 'profitability', label: 'Rentabilité', description: 'Devisé vs coût réel (matériel + main d’œuvre).' },
];

// Modules whose availability also depends on the org's plan, beyond the
// per-project toggle.
export const PROJECT_MODULE_PLAN_GATED: Partial<Record<ModuleKey, keyof Plan>> = {
  profitability: 'has_profitability',
};

export function isModuleEnabled(enabledModules: string[] | undefined, key: ModuleKey): boolean {
  return (enabledModules ?? []).includes(key);
}

// Separate mechanism from isModuleEnabled() above: these are Super
// Admin-granted modules (private or plan-override), keyed by an arbitrary
// string registered in the `modules` table — not one of the ModuleKey
// constants that ship with every build. Never gate on organization.name or
// any other client-known identity; the grant lives only in
// organization_modules, checked fresh against the current org.
//
// Two-tier: `enabled` is the platform admin making the module AVAILABLE to
// this org; `activated` is the org's own admin actually turning it on for
// their team (see compte/modules.tsx). A module only gates real behavior
// once both are true — being granted access doesn't switch it on by itself.
export async function hasModule(organizationId: string | undefined, moduleKey: string): Promise<boolean> {
  if (!organizationId) return false;
  const { data } = await supabase
    .from('organization_modules')
    .select('enabled, activated, modules!inner(key)')
    .eq('organization_id', organizationId)
    .eq('modules.key', moduleKey)
    .eq('enabled', true)
    .eq('activated', true)
    .maybeSingle();
  return !!data;
}

export interface PrivateModuleGrant {
  key: string;
  name: string;
  description: string | null;
  visibility: string;
  activated: boolean;
}

// Every private module currently made available to the caller's org (by a
// platform admin), for the org's own admin to switch on/off themselves.
export async function listMyPrivateModules(): Promise<PrivateModuleGrant[]> {
  const { data, error } = await supabase.rpc('list_my_private_modules');
  if (error) {
    console.error('[modules] list_my_private_modules failed:', error.message);
    return [];
  }
  return (data ?? []) as PrivateModuleGrant[];
}

export async function toggleModuleActivation(moduleKey: string, activated: boolean): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('toggle_organization_module_activation', { module_key: moduleKey, activated });
  return { error: error?.message ?? null };
}

export function useModule(moduleKey: string): boolean {
  const { organization } = useAuth();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const orgId = organization?.id;
    if (!orgId) {
      setEnabled(false);
      return;
    }
    hasModule(orgId, moduleKey).then((result) => {
      if (!cancelled) setEnabled(result);
    });
    return () => {
      cancelled = true;
    };
  }, [organization?.id, moduleKey]);

  return enabled;
}
