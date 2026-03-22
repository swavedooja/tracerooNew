const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oragstfcpusygqgvwqjv.supabase.co';
const supabaseKey = 'sb_publishable_ZJeWJcvR3u9y27YEn9xFiw_vimiz_EQ'; // Note: In production, use service_role key for seeding

const supabase = createClient(supabaseUrl, supabaseKey);

const fmcgData = {
    definitions: [
        { def_type: 'MATERIAL_TYPE', def_value: 'FINISHED_SHAMPOO', description: 'Finished Shampoo Bottle' },
        { def_type: 'MATERIAL_TYPE', def_value: 'FINISHED_CREAM', description: 'Finished Fairness Cream' },
        { def_type: 'MATERIAL_CAT', def_value: 'SHAMPOO_200ML', description: 'Shampoo 200ml' },
        { def_type: 'MATERIAL_CAT', def_value: 'SHAMPOO_500ML', description: 'Shampoo 500ml' },
        { def_type: 'MATERIAL_CAT', def_value: 'CREAM_50GM', description: 'Fairness Cream 50g' },
        { def_type: 'MATERIAL_CAT', def_value: 'CREAM_100GM', description: 'Fairness Cream 100g' }
    ],
    materials: [
        {
            id: 'e1234567-e89b-12d3-a456-426614174003',
            code: 'SHAMPOO-200ML-01',
            name: 'Silky Smooth Shampoo 200ml',
            description: 'Daily use shampoo, 200ml bottle',
            type: 'FINISHED_SHAMPOO',
            category: 'SHAMPOO_200ML',
            base_uom: 'BTL',
            status: 'ACTIVE',
            is_serial_managed: true
        },
        {
            id: 'e1234567-e89b-12d3-a456-426614174004',
            code: 'SHAMPOO-500ML-01',
            name: 'Silky Smooth Shampoo 500ml',
            description: 'Daily use shampoo, 500ml pump bottle',
            type: 'FINISHED_SHAMPOO',
            category: 'SHAMPOO_500ML',
            base_uom: 'BTL',
            status: 'ACTIVE',
            is_serial_managed: true
        },
        {
            id: 'e1234567-e89b-12d3-a456-426614174005',
            code: 'CREAM-50GM-01',
            name: 'Radiance Fairness Cream 50g',
            description: 'Skin brightening cream, tube',
            type: 'FINISHED_CREAM',
            category: 'CREAM_50GM',
            base_uom: 'TUB',
            status: 'ACTIVE',
            is_serial_managed: true
        },
        {
            id: 'e1234567-e89b-12d3-a456-426614174006',
            code: 'CREAM-100GM-01',
            name: 'Radiance Fairness Cream 100g',
            description: 'Skin brightening cream, jar',
            type: 'FINISHED_CREAM',
            category: 'CREAM_100GM',
            base_uom: 'JAR',
            status: 'ACTIVE',
            is_serial_managed: true
        }
    ],
    hierarchy: {
        id: '01234567-e89b-12d3-a456-426614174998',
        name: 'Standard Shampoo Packaging',
        description: 'Bottle -> Display Box (12) -> Master Carton (48) -> Pallet'
    },
    levels: [
        { id: '01234567-e89b-12d3-a456-426614174904', hierarchy_id: '01234567-e89b-12d3-a456-426614174998', level_order: 1, level_name: 'Bottle' },
        { id: '01234567-e89b-12d3-a456-426614174905', hierarchy_id: '01234567-e89b-12d3-a456-426614174998', level_order: 2, level_name: 'Display Box' },
        { id: '01234567-e89b-12d3-a456-426614174906', hierarchy_id: '01234567-e89b-12d3-a456-426614174998', level_order: 3, level_name: 'Master Carton' },
        { id: '01234567-e89b-12d3-a456-426614174907', hierarchy_id: '01234567-e89b-12d3-a456-426614174998', level_order: 4, level_name: 'Pallet' }
    ]
};

async function reworkData() {
    console.log('--- Starting FMCG Data Rework ---');

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

    console.log('Clearing old hierarchies...');
    const { error: errL } = await supabase.from('packaging_level').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errL) console.error('Error clearing levels:', errL.message);

    const { error: errH } = await supabase.from('packaging_hierarchy').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errH) console.error('Error clearing hierarchies:', errH.message);

    console.log('✓ Hierarchies cleared');

    console.log('Clearing old materials...');
    const { error: errM } = await supabase.from('materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (errM) console.error('Error clearing materials:', errM.message);
    console.log('✓ Materials cleared');

    console.log('Seeding Master Definitions...');
    const { error: errDef } = await supabase.from('master_definitions').upsert(fmcgData.definitions, { onConflict: 'def_type,def_value' });
    if (errDef) console.error('Error seeding definitions:', errDef.message);

    console.log('Seeding FMCG Materials...');
    const { error: errMat } = await supabase.from('materials').insert(fmcgData.materials);
    if (errMat) console.error('Error seeding materials:', errMat.message);

    console.log('Seeding FMCG Packaging Hierarchy...');
    const { error: errHier } = await supabase.from('packaging_hierarchy').insert([fmcgData.hierarchy]);
    if (errHier) console.error('Error seeding hierarchy:', errHier.message);

    const { error: errLev } = await supabase.from('packaging_level').insert(fmcgData.levels);
    if (errLev) console.error('Error seeding levels:', errLev.message);

    console.log('--- FMCG Data Rework Complete ---');
}

reworkData();
