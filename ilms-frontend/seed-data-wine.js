const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oragstfcpusygqgvwqjv.supabase.co';
const supabaseKey = 'sb_publishable_ZJeWJcvR3u9y27YEn9xFiw_vimiz_EQ'; // Note: In production, use service_role key for seeding

const supabase = createClient(supabaseUrl, supabaseKey);

const wineData = {
    definitions: [
        { def_type: 'MATERIAL_TYPE', def_value: 'FINISHED_WINE', description: 'Finished Bottled Wine' },
        { def_type: 'MATERIAL_CAT', def_value: 'RED_WINE', description: 'Red Wine' },
        { def_type: 'MATERIAL_CAT', def_value: 'WHITE_WINE', description: 'White Wine' },
        { def_type: 'MATERIAL_CAT', def_value: 'ROSE_WINE', description: 'Rose Wine' }
    ],
    materials: [
        {
            id: 'e1234567-e89b-12d3-a456-426614174001',
            code: 'WINE-CH-2024',
            name: 'Chardonnay Reserve 2024',
            description: 'Premium white wine, vintage 2024',
            type: 'FINISHED_WINE',
            category: 'WHITE_WINE',
            base_uom: 'BTL',
            status: 'ACTIVE',
            is_serial_managed: true
        },
        {
            id: 'e1234567-e89b-12d3-a456-426614174002',
            code: 'WINE-CS-2023',
            name: 'Cabernet Sauvignon 2023',
            description: 'Full-bodied red wine, vintage 2023',
            type: 'FINISHED_WINE',
            category: 'RED_WINE',
            base_uom: 'BTL',
            status: 'ACTIVE',
            is_serial_managed: true
        }
    ],
    hierarchy: {
        id: '01234567-e89b-12d3-a456-426614174999',
        name: 'Standard Wine Packaging',
        description: 'Bottle -> Case (6) -> Pallet (60 Cases)'
    },
    levels: [
        { id: '01234567-e89b-12d3-a456-426614174901', hierarchy_id: '01234567-e89b-12d3-a456-426614174999', level_order: 1, level_name: 'Bottle' },
        { id: '01234567-e89b-12d3-a456-426614174902', hierarchy_id: '01234567-e89b-12d3-a456-426614174999', level_order: 2, level_name: 'Case' },
        { id: '01234567-e89b-12d3-a456-426614174903', hierarchy_id: '01234567-e89b-12d3-a456-426614174999', level_order: 3, level_name: 'Pallet' }
    ]
};

async function reworkData() {
    console.log('--- Starting Wine Data Rework ---');

    // 1. Clear Transactional Data
    console.log('Cleaning up existing transactional data...');
    const tables = ['trace_event', 'aggregation', 'inventory', 'serial_number_pool', 'container_unit'];
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
            console.error(`Error clearing ${table}:`, error.message);
        } else {
            console.log(`✓ Cleared ${table}`);
        }
    }

    // 2. Clear existing Levels and Hierarchies to avoid conflicts
    console.log('Clearing old hierarchies...');
    const { error: errL } = await supabase.from('packaging_level').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errL) console.error('Error clearing levels:', errL.message);

    const { error: errH } = await supabase.from('packaging_hierarchy').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errH) console.error('Error clearing hierarchies:', errH.message);

    console.log('✓ Hierarchies cleared');

    // 3. Clear existing Materials
    console.log('Clearing old materials...');
    const { error: errM } = await supabase.from('materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errM) console.error('Error clearing materials:', errM.message);
    console.log('✓ Materials cleared');

    // 4. Seed New Data
    console.log('Seeding Master Definitions...');
    const { error: errDef } = await supabase.from('master_definitions').upsert(wineData.definitions, { onConflict: 'def_type,def_value' });
    if (errDef) console.error('Error seeding definitions:', errDef.message);

    console.log('Seeding Wine Materials...');
    const { error: errMat } = await supabase.from('materials').insert(wineData.materials);
    if (errMat) console.error('Error seeding materials:', errMat.message);

    console.log('Seeding Wine Packaging Hierarchy...');
    const { error: errHier } = await supabase.from('packaging_hierarchy').insert([wineData.hierarchy]);
    if (errHier) console.error('Error seeding hierarchy:', errHier.message);

    const { error: errLev } = await supabase.from('packaging_level').insert(wineData.levels);
    if (errLev) console.error('Error seeding levels:', errLev.message);

    console.log('--- Wine Data Rework Complete ---');
}

reworkData();
