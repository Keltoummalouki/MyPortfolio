// Freelance feature (lead pipeline: inquiries, statuses). Public API surface.
//
// Only the client-safe schema is re-exported here. Server-only data access
// (`queries`) and Server Actions (`actions`) are imported directly from their
// modules by server/client code.
export * from './schema'
