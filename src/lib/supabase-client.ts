import { createClient } from '@supabase/supabase-js'

// Singleton pattern for Supabase client - prevents multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

/**
 * Gets the Supabase client instance with client-side only initialization
 * This prevents SSR errors by ensuring the client is only created in the browser
 */
export const getSupabaseClient = () => {
  // Only initialize on client-side - prevents SSR hydration issues
  if (typeof window === 'undefined') {
    return null
  }

  // Return existing instance if already created (singleton pattern)
  if (supabaseInstance) return supabaseInstance

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return null
  }

  try {
    // Create new Supabase client instance
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    return supabaseInstance
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    return null
  }
}

/**
 * Gets Supabase admin client with service role permissions
 * Used for server-side operations that require elevated permissions
 */
export const getSupabaseAdmin = () => {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Validate admin credentials
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase admin environment variables')
    return null
  }

  try {
    // Create admin client with service role key
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false, // Disable auto-refresh for admin operations
        persistSession: false    // Don't persist admin sessions
      }
    })
  } catch (error) {
    console.error('Error creating Supabase admin client:', error)
    return null
  }
}
