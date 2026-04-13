import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Supabase client for client-side operations
 */
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase admin client for server-side operations
 * Has full access to database and auth
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabaseClient) {
    console.warn('Supabase client not configured');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('_pg_stat_statements')
      .select('*')
      .limit(1);

    if (error && error.code !== '42P01') {
      // 42P01 = table does not exist (expected)
      throw error;
    }

    console.log('✓ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error);
    return false;
  }
}

/**
 * Get storage URL for file uploads
 */
export function getStorageUrl(
  bucket: string,
  path: string
): string | null {
  if (!supabaseUrl) return null;

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; path: string } | null> {
  if (!supabaseClient) {
    console.warn('Supabase client not configured');
    return null;
  }

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    return {
      url: getStorageUrl(bucket, data.path) || '',
      path: data.path,
    };
  } catch (error) {
    console.error('Failed to upload file:', error);
    return null;
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  if (!supabaseClient) {
    console.warn('Supabase client not configured');
    return false;
  }

  try {
    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

/**
 * Migration helpers
 */

/**
 * Check if migration has been run
 */
export async function isMigrationRun(migrationName: string): Promise<boolean> {
  if (!supabaseAdmin) {
    console.warn('Supabase admin client not configured');
    return false;
  }

  try {
    // This would check against a migrations table in the database
    // For now, we'll assume migrations are managed by Prisma
    return true;
  } catch (error) {
    console.error('Failed to check migration status:', error);
    return false;
  }
}

/**
 * Reset database (development only)
 */
export async function resetDatabase(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  if (!supabaseAdmin) {
    console.warn('Supabase admin client not configured');
    return false;
  }

  try {
    // This would truncate all tables or drop and recreate the schema
    // This should only be called in development
    console.warn('Database reset would happen here');
    return true;
  } catch (error) {
    console.error('Failed to reset database:', error);
    return false;
  }
}
