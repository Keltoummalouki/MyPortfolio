// Inbox feature (contact messages: statuses). Public API surface.
//
// Only the client-safe schema is re-exported here. Server-only data access
// (`queries`), Server Actions (`actions`), and the Turnstile verifier
// (`turnstile`) are imported directly from their modules by server/client code.
export * from './schema'
