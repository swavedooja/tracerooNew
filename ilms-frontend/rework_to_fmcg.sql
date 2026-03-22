-- ===================================================================================
-- FMCG Track and Trace - Data Rework Script
-- ===================================================================================

-- 1. Truncate Transactional Data (Order matters for FKs)
TRUNCATE TABLE dbo.trace_event;
TRUNCATE TABLE dbo.aggregation;
TRUNCATE TABLE dbo.inventory;
TRUNCATE TABLE dbo.serial_number_pool;
TRUNCATE TABLE dbo.container_unit;

-- 2. Clear existing Master Data (Optional: keeping definitions, clearing materials and hierarchies)
-- If we want a fresh start for FMCG:
DELETE FROM dbo.packaging_level;
DELETE FROM dbo.packaging_hierarchy;
DELETE FROM dbo.materials;

-- 3. Update Master Definitions for FMCG
INSERT INTO dbo.master_definitions (def_type, def_value, description)
SELECT 'MATERIAL_TYPE', 'FINISHED_SHAMPOO', 'Finished Shampoo Bottle'
WHERE NOT EXISTS (SELECT 1 FROM dbo.master_definitions WHERE def_type = 'MATERIAL_TYPE' AND def_value = 'FINISHED_SHAMPOO');

INSERT INTO dbo.master_definitions (def_type, def_value, description)
SELECT 'MATERIAL_TYPE', 'FINISHED_CREAM', 'Finished Fairness Cream'
WHERE NOT EXISTS (SELECT 1 FROM dbo.master_definitions WHERE def_type = 'MATERIAL_TYPE' AND def_value = 'FINISHED_CREAM');

INSERT INTO dbo.master_definitions (def_type, def_value, description)
VALUES 
('MATERIAL_CAT', 'SHAMPOO_200ML', 'Shampoo 200ml'),
('MATERIAL_CAT', 'SHAMPOO_500ML', 'Shampoo 500ml'),
('MATERIAL_CAT', 'CREAM_50GM', 'Fairness Cream 50g'),
('MATERIAL_CAT', 'CREAM_100GM', 'Fairness Cream 100g')
ON CONFLICT (def_type, def_value) DO NOTHING;

-- 4. Seed FMCG Materials
INSERT INTO dbo.materials (id, code, name, description, type, category, base_uom, status, is_serial_managed)
VALUES 
('e1234567-e89b-12d3-a456-426614174003', 'SHAMPOO-200ML-01', 'Silky Smooth Shampoo 200ml', 'Daily use shampoo, 200ml bottle', 'FINISHED_SHAMPOO', 'SHAMPOO_200ML', 'BTL', 'ACTIVE', 1),
('e1234567-e89b-12d3-a456-426614174004', 'SHAMPOO-500ML-01', 'Silky Smooth Shampoo 500ml', 'Daily use shampoo, 500ml pump bottle', 'FINISHED_SHAMPOO', 'SHAMPOO_500ML', 'BTL', 'ACTIVE', 1),
('e1234567-e89b-12d3-a456-426614174005', 'CREAM-50GM-01', 'Radiance Fairness Cream 50g', 'Skin brightening cream, tube', 'FINISHED_CREAM', 'CREAM_50GM', 'TUB', 'ACTIVE', 1),
('e1234567-e89b-12d3-a456-426614174006', 'CREAM-100GM-01', 'Radiance Fairness Cream 100g', 'Skin brightening cream, jar', 'FINISHED_CREAM', 'CREAM_100GM', 'JAR', 'ACTIVE', 1);

-- 5. Define FMCG Packaging Hierarchy
INSERT INTO dbo.packaging_hierarchy (id, name, description)
VALUES ('01234567-e89b-12d3-a456-426614174998', 'Standard Shampoo Packaging', 'Bottle -> Display Box (12) -> Master Carton (48) -> Pallet');

INSERT INTO dbo.packaging_level (id, hierarchy_id, level_order, level_name)
VALUES 
('01234567-e89b-12d3-a456-426614174904', '01234567-e89b-12d3-a456-426614174998', 1, 'Bottle'),
('01234567-e89b-12d3-a456-426614174905', '01234567-e89b-12d3-a456-426614174998', 2, 'Display Box'),
('01234567-e89b-12d3-a456-426614174906', '01234567-e89b-12d3-a456-426614174998', 3, 'Master Carton'),
('01234567-e89b-12d3-a456-426614174907', '01234567-e89b-12d3-a456-426614174998', 4, 'Pallet');
