import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdminInstance: any = null;

// Instanciação Lazy Defensiva para evitar crashes no import do módulo se as variáveis não estiverem presentes
export function getSupabaseAdmin() {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase no backend não inicializado: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes nas variáveis de ambiente.');
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminInstance;
}
