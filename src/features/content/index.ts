// Content feature (projects, experience, education, certifications, skills,
// services, site settings). Public API surface — UI imports typed functions
// from here, never raw Supabase queries.
//
// Only client-safe modules are re-exported here. Server-only data access
// (`projects.queries`) and Server Actions (`projects.actions`) are imported
// directly from their modules by server code.
export * from './translations'
export * from './i18n-json'
export * from './projects.map'
export * from './projects.schema'
