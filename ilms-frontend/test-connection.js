const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oragstfcpusygqgvwqjv.supabase.co';
const supabaseKey = 'sb_publishable_ZJeWJcvR3u9y27YEn9xFiw_vimiz_EQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('materials').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            process.exit(1);
        } else {
            console.log('Connection successful! Table "materials" is accessible.');
            console.log('Count metadata:', data); // might be null if head:true, but error being null is key
        }

        // Try to fetch definitions too
        const { data: defs, error: defError } = await supabase.from('master_definitions').select('*').limit(1);
        if (defError) {
            console.error('Failed to access master_definitions:', defError.message);
        } else {
            console.log('Successfully accessed "master_definitions". Found rows:', defs.length);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

testConnection();
