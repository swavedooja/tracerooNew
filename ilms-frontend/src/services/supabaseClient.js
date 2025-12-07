import { createClient } from '@supabase/supabase-js';

// NOTE: Ideally these should be in .env, but for local setup simple bypass is used.
const supabaseUrl = 'https://oragstfcpusygqgvwqjv.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZJeWJcvR3u9y27YEn9xFiw_vimiz_EQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
