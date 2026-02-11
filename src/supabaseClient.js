import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zvzmgywaoecfyqksjwb.supabase.co'
const supabaseAnonKey = 'sb_publishable_kM7f5L_HQAQ8xK2IiMfxJA_zJkPacIJ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})