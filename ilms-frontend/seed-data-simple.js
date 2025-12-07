const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oragstfcpusygqgvwqjv.supabase.co';
const supabaseKey = 'sb_publishable_ZJeWJcvR3u9y27YEn9xFiw_vimiz_EQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const definitions = [
    { def_type: 'MATERIAL_TYPE', def_value: 'RAW', description: 'Raw Material' },
    { def_type: 'MATERIAL_TYPE', def_value: 'SEMI', description: 'Semi-Finished' },
    { def_type: 'MATERIAL_TYPE', def_value: 'FIN', description: 'Finished Goods' },
    { def_type: 'MATERIAL_CAT', def_value: 'ELECTRONICS', description: 'Electronics' },
    { def_type: 'MATERIAL_CAT', def_value: 'MECHANICAL', description: 'Mechanical' },
    { def_type: 'MATERIAL_CAT', def_value: 'CHEMICAL', description: 'Chemical' },
    { def_type: 'LOCATION_TYPE', def_value: 'WAREHOUSE', description: 'Warehouse' },
    { def_type: 'LOCATION_TYPE', def_value: 'ZONE', description: 'Zone' },
    { def_type: 'LOCATION_TYPE', def_value: 'RACK', description: 'Rack' },
    { def_type: 'LOCATION_TYPE', def_value: 'BIN', description: 'Bin' },
    { def_type: 'LOCATION_CAT', def_value: 'GENERAL', description: 'General' },
    { def_type: 'LOCATION_CAT', def_value: 'COLD_CHAIN', description: 'Cold Chain' }
];

async function seed() {
    console.log('Seeding Master Definitions...');
    // Try one by one or batch insert ignoring conflicts manually if possible
    const { data, error } = await supabase.from('master_definitions').insert(definitions).select();

    if (error) {
        console.error('Error seeding definitions:', error);
    } else {
        console.log('Definitions seeded:', data.length);
    }

    const { data: mats, error: matError } = await supabase.from('materials').insert([{
        id: '123e4567-e89b-12d3-a456-426614174001',
        code: 'MAT-001',
        name: 'Steel Sheet 2mm',
        description: 'High grade steel sheet',
        type: 'RAW',
        category: 'MECHANICAL',
        base_uom: 'KG',
        status: 'ACTIVE',
        is_batch_managed: true,
        min_stock: 500,
        gross_weight: 10
    }]).select();

    if (matError) {
        console.error('Error seeding materials:', matError);
    } else {
        console.log('Material MAT-001 seeded.');
    }
}

seed();
