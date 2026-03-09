-- ===================================================================================
-- Wine Bottle Track and Trace - Data Rework Script
-- ===================================================================================

-- 1. Truncate Transactional Data (Order matters for FKs)
TRUNCATE TABLE dbo.trace_event;
TRUNCATE TABLE dbo.aggregation;
TRUNCATE TABLE dbo.inventory;
TRUNCATE TABLE dbo.serial_number_pool;
TRUNCATE TABLE dbo.container_unit;

-- 2. Clear existing Master Data (Optional: keeping definitions, clearing materials and hierarchies)
-- If we want a fresh start for Wine:
DELETE FROM dbo.packaging_level;
DELETE FROM dbo.packaging_hierarchy;
DELETE FROM dbo.materials;

-- 3. Update Master Definitions for Wine
INSERT INTO dbo.master_definitions (def_type, def_value, description)
SELECT 'MATERIAL_TYPE', 'FINISHED_WINE', 'Finished Bottled Wine'
WHERE NOT EXISTS (SELECT 1 FROM dbo.master_definitions WHERE def_type = 'MATERIAL_TYPE' AND def_value = 'FINISHED_WINE');

INSERT INTO dbo.master_definitions (def_type, def_value, description)
VALUES 
('MATERIAL_CAT', 'RED_WINE', 'Red Wine'),
('MATERIAL_CAT', 'WHITE_WINE', 'White Wine'),
('MATERIAL_CAT', 'ROSE_WINE', 'Rose Wine')
ON CONFLICT (def_type, def_value) DO NOTHING;

-- 4. Seed Wine Materials
INSERT INTO dbo.materials (id, code, name, description, type, category, base_uom, status, is_serial_managed)
VALUES 
('e1234567-e89b-12d3-a456-426614174001', 'WINE-CH-2024', 'Chardonnay Reserve 2024', 'Premium white wine, vintage 2024', 'FINISHED_WINE', 'WHITE_WINE', 'BTL', 'ACTIVE', 1),
('e1234567-e89b-12d3-a456-426614174002', 'WINE-CS-2023', 'Cabernet Sauvignon 2023', 'Full-bodied red wine, vintage 2023', 'FINISHED_WINE', 'RED_WINE', 'BTL', 'ACTIVE', 1);

-- 5. Define Wine Packaging Hierarchy
INSERT INTO dbo.packaging_hierarchy (id, name, description)
VALUES ('01234567-e89b-12d3-a456-426614174999', 'Standard Wine Packaging', 'Bottle -> Case (6) -> Pallet (60 Cases)');

INSERT INTO dbo.packaging_level (id, hierarchy_id, level_order, level_name)
VALUES 
('01234567-e89b-12d3-a456-426614174901', '01234567-e89b-12d3-a456-426614174999', 1, 'Bottle'),
('01234567-e89b-12d3-a456-426614174902', '01234567-e89b-12d3-a456-426614174999', 2, 'Case'),
('01234567-e89b-12d3-a456-426614174903', '01234567-e89b-12d3-a456-426614174999', 3, 'Pallet');

