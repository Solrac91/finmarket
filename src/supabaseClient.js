// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// TEMPORAL - para debug
console.log('DEBUG ENV:', {
  url: process.env.REACT_APP_SUPABASE_URL,
  keyExists: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV
})

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERROR: Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')