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

const materials = [
    {
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
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174002',
        code: 'PROD-Phone-X',
        name: 'Smartphone Model X',
        description: 'Flagship smartphone',
        type: 'FIN',
        category: 'ELECTRONICS',
        base_uom: 'EA',
        status: 'ACTIVE',
        is_serial_managed: true,
        shelf_life_days: 730
    }
];

const locations = [
    {
        id: '123e4567-e89b-12d3-a456-426614174100',
        code: 'WH-MAIN',
        name: 'Main Warehouse',
        type: 'WAREHOUSE',
        category: 'GENERAL',
        status: 'ACTIVE',
        address_line1: '123 Logistics Blvd'
    },
    {
        id: '123e4567-e89b-12d3-a456-426614174101',
        code: 'ZN-A',
        name: 'Zone A',
        type: 'ZONE',
        category: 'GENERAL',
        parent_id: '123e4567-e89b-12d3-a456-426614174100',
        status: 'ACTIVE'
    }
];

async function seed() {
    console.log('Seeding Master Definitions...');
    const { error: defError } = await supabase.from('master_definitions').upsert(definitions, { onConflict: 'def_type,def_value' });
    if (defError) console.error('Error seeding definitions:', defError);
    else console.log('Definitions seeded.');

    console.log('Seeding Materials...');
    // Clean insert might fail if dupes, but UPSERT on unique constraint (code) should work if table has it.
    // However, Supabase upsert requires specifying the constraint column if likely conflicts, or just try insert and ignore.
    const { error: matError } = await supabase.from('materials').upsert(materials, { onConflict: 'code' });
    if (matError) console.error('Error seeding materials:', matError);
    else console.log('Materials seeded.');

    console.log('Seeding Locations...');
    const { error: locError } = await supabase.from('locations').upsert(locations, { onConflict: 'code' });
    if (locError) console.error('Error seeding locations:', locError);
    else console.log('Locations seeded.');
}

seed();
