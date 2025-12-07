export const mockData = {
    masterDefinitions: {
        list: [
            { id: 1, defType: 'MATERIAL_TYPE', defValue: 'RAW', description: 'Raw Material' },
            { id: 2, defType: 'MATERIAL_TYPE', defValue: 'SEMI', description: 'Semi-Finished' },
            { id: 3, defType: 'MATERIAL_TYPE', defValue: 'FIN', description: 'Finished Goods' },
            { id: 4, defType: 'LOCATION_TYPE', defValue: 'WAREHOUSE', description: 'Warehouse Building' },
            { id: 5, defType: 'LOCATION_TYPE', defValue: 'ZONE', description: 'Internal Zone' },
            { id: 6, defType: 'LOCATION_TYPE', defValue: 'RACK', description: 'Storage Rack' },
            { id: 7, defType: 'LOCATION_TYPE', defValue: 'BIN', description: 'Storage Bin' },
        ]
    },
    materials: {
        list: [
            {
                code: 'MAT-001',
                name: 'High Grade Steel Coil',
                description: 'Industrial Steel',
                type: 'RAW',
                category: 'MECHANICAL',
                baseUOM: 'KG',
                status: 'ACTIVE'
            },
            {
                code: 'MAT-002',
                name: 'iPhone 15 Pro',
                description: 'Smartphone',
                type: 'FIN',
                category: 'ELECTRONICS',
                baseUOM: 'EA',
                status: 'ACTIVE'
            }
        ],
        details: (code) => ({
            code: code,
            name: 'Mock Material',
            description: 'Mock Description',
            type: 'RAW',
            category: 'GENERAL',
            baseUOM: 'EA',
            status: 'ACTIVE',
            isBatchManaged: true,
            isSerialManaged: true,
            shelfLifeDays: 365,
            minStock: 100,
            grossWeight: 10.5,
            weightUOM: 'KG'
        }),
        images: [],
        documents: []
    },
    locations: {
        list: [
            { id: 'L1', code: 'WH-001', name: 'Central Distribution Hub', type: 'WAREHOUSE', category: 'GENERAL', addressLine1: 'New York, USA' },
            { id: 'L2', code: 'WH-002', name: 'West Coast Facility', type: 'WAREHOUSE', category: 'COLD_CHAIN', addressLine1: 'California, USA' },
            { id: 'L3', code: 'ZN-A', name: 'Zone A', type: 'ZONE', category: 'GENERAL', parent: { code: 'WH-001' } }
        ],
        details: (code) => ({
            code: code,
            name: 'Mock Location',
            type: 'WAREHOUSE',
            category: 'GENERAL',
            addressLine1: 'Mock Address',
            capacityVolume: 1000.0,
            gln: '1234567890123'
        })
    },
    // ... keep other mocks if needed, truncated for brevity in this specific update unless required
    packaging: {
        get: (id) => ({ id: id || 'PKG-001', type: 'Pallet' }),
        preview: (id) => ({ preview_url: '#' })
    },
    labelTemplates: { list: [], details: (id) => ({}) },
    inventory: { list: [] },
    trace: { history: (serial) => ({}) }
};
