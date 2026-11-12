import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Project Settings -> API in the Supabase dashboard.
const SUPABASE_URL = 'https://uavrklzdjwhupqotovqe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3UmAiHUNjSULCdt3TLwVQQ_zEZAwGzy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
