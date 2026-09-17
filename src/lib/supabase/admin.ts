import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client using Service Role Key
// ONLY USE THIS SERVER-SIDE for privileged operations (Storage uploads, User management)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
