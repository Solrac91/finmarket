// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Hardcoded temporalmente para debug
const supabaseUrl = 'https://zvzmgygwaoecfyqksjwb.supabase.co'
const supabaseAnonKey = 'sb_publishable_kM7f5L_HQAQ8xK2IiMfxJA_zJkPacIJ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)