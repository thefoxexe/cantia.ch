// Human-readable reference for private/experimental modules — NOT the
// source of truth for access (that's the `modules` + `organization_modules`
// tables, checked via hasModule()/useModule() in lib/modules.ts). This file
// exists so a developer adding a new private module has one place to note
// what it does and where it lives; it is never imported to decide access.
//
// Workflow for a new private module:
//   1. Write the feature's code/routes as usual.
//   2. Add an entry here (documentation only).
//   3. Register it for real via Super Admin → Modules → "Nouveau module"
//      (or the admin_upsert_module RPC), with visibility: 'private'.
//   4. Toggle it on for exactly one organization from that module's row in
//      Super Admin → Modules, or from that organization's detail page.
//   5. Only that organization sees/can reach it — everyone else gets
//      nothing, including via a direct URL to its route.
export interface ModuleRegistryEntry {
  key: string;
  name: string;
  description: string;
  route: string;
  visibility: 'standard' | 'private' | 'experimental';
}

// No private modules exist yet — this list stays empty until the first one
// ships. It intentionally does not list any speculative/future module.
export const MODULE_REGISTRY: ModuleRegistryEntry[] = [];
