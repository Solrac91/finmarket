// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Hardcoded temporalmente para debug
const supabaseUrl = 'https://zvzmgygwaoecfyqksjwb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2em1neXdhb2VjZnlxa3Nqd2IiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDU1MzgxMCwiZXhwIjoyMDUwMTI5ODEwfQ.NlbD0uG8qxQ7_cNHdIa8FXEPbvgdCOH_pLkAKZoN9MA'  // Copia la key completa de tu .env

export const supabase = createClient(supabaseUrl, supabaseAnonKey)