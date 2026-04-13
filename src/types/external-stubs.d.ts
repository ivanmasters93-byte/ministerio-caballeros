// Type stubs for optional/uninstalled packages
// These are referenced in integration and auth files

// ============================================================
// svix (Clerk webhook verification)
// ============================================================
declare module 'svix' {
  export class Webhook {
    constructor(secret: string)
    verify(payload: string, headers: Record<string, string>): { type: string; data: Record<string, unknown> }
  }
}

// ============================================================
// @supabase/supabase-js
// ============================================================
declare module '@supabase/supabase-js' {
  interface QueryBuilder {
    select(columns?: string): QueryBuilder
    limit(count: number): Promise<{ data: unknown; error: { code?: string; message?: string } | null }>
  }
  interface StorageBucket {
    upload(path: string, file: File | Buffer | Blob, options?: Record<string, unknown>): Promise<{ data: { path: string }; error: { message?: string } | null }>
    remove(paths: string[]): Promise<{ data: unknown; error: { message?: string } | null }>
    list(prefix?: string): Promise<{ data: unknown[]; error: unknown }>
  }
  interface Storage {
    from(bucket: string): StorageBucket
  }
  interface SupabaseClient {
    from(table: string): QueryBuilder
    storage: Storage
  }
  export function createClient(url: string, key: string, options?: Record<string, unknown>): SupabaseClient
}

// ============================================================
// @prisma/adapter-better-sqlite3
// ============================================================
declare module '@prisma/adapter-better-sqlite3' {
  import type { SqlDriverAdapterFactory } from '@prisma/driver-adapter-utils'
  export class PrismaBetterSqlite3 implements SqlDriverAdapterFactory {
    readonly provider: 'sqlite'
    readonly adapterName: string
    constructor(options: { url: string })
    connect(): Promise<import('@prisma/driver-adapter-utils').SqlDriverAdapter>
  }
}

// ============================================================
// next-auth
// ============================================================
declare module 'next-auth' {
  export interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
  export interface User {
    id?: string
    role?: string
  }
  export type NextAuthConfig = {
    providers?: unknown[]
    callbacks?: Record<string, (args: Record<string, unknown>) => Promise<unknown>>
    pages?: Record<string, string>
    session?: Record<string, unknown>
  }
  export default function NextAuth(config: Record<string, unknown>): {
    handlers: { GET: unknown; POST: unknown }
    auth: () => Promise<Session | null>
    signIn: (provider?: string, options?: Record<string, unknown>) => Promise<unknown>
    signOut: (options?: Record<string, unknown>) => Promise<unknown>
  }
}

declare module 'next-auth/react' {
  export function useSession(): { data: import('next-auth').Session | null; status: string }
  export function signIn(provider?: string, options?: Record<string, unknown>): Promise<{ error?: string; ok?: boolean; url?: string } | undefined>
  export function signOut(options?: Record<string, unknown>): Promise<{ url?: string } | undefined>
  export function SessionProvider(props: { children: React.ReactNode; session?: unknown }): React.ReactElement
}

declare module 'next-auth/providers/credentials' {
  interface CredentialsConfig {
    name: string
    credentials: Record<string, { label: string; type: string }>
    authorize: (credentials: Record<string, string | undefined>) => Promise<unknown>
  }
  export default function CredentialsProvider(config: CredentialsConfig): unknown
}

declare module 'next-auth/jwt' {
  export interface JWT {
    id?: string
    role?: string
    [key: string]: unknown
  }
  export function getToken(options: { req: unknown; secret?: string }): Promise<JWT | null>
}

// ============================================================
// mailgun.js
// ============================================================
declare module 'mailgun.js' {
  interface MailgunClient {
    messages: {
      create(domain: string, data: Record<string, unknown>): Promise<unknown>
    }
  }
  export default class Mailgun {
    constructor(FormData: unknown)
    client(options: { username: string; key: string }): MailgunClient
  }
}
