import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please create a .env.local file in your project root with:');
  console.error('VITE_SUPABASE_URL=your-project-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('');
  console.error('Get these values from:');
  console.error('https://supabase.com/dashboard → Your Project → Settings → API');
  
  throw new Error(
    'Missing Supabase environment variables. Check console for details.'
  );
}

console.log('✅ Supabase client initialized');
console.log('📍 URL:', supabaseUrl);

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper function to check connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('parties').select('count');
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Supabase connection exception:', err);
    return { success: false, error: err };
  }
}
