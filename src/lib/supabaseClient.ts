// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Get your Supabase project URL and API key from the Supabase dashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Initialize the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)