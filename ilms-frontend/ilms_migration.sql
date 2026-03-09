-- ===================================================================================
-- ILMS - Supabase to MS SQL Migration Script
-- Generated based on application code analysis (APIService.js, seed-data.js)
-- ===================================================================================

-- Ensure you are using the correct database
-- USE [YourDatabaseName];
-- GO

-- Drop tables if they exist (Order matters due to FKs)
IF OBJECT_ID('dbo.trace_event', 'U') IS NOT NULL DROP TABLE dbo.trace_event;
IF OBJECT_ID('dbo.aggregation', 'U') IS NOT NULL DROP TABLE dbo.aggregation;
IF OBJECT_ID('dbo.container_unit', 'U') IS NOT NULL DROP TABLE dbo.container_unit;
IF OBJECT_ID('dbo.serial_number_pool', 'U') IS NOT NULL DROP TABLE dbo.serial_number_pool;
IF OBJECT_ID('dbo.inventory', 'U') IS NOT NULL DROP TABLE dbo.inventory;
IF OBJECT_ID('dbo.packaging_level', 'U') IS NOT NULL DROP TABLE dbo.packaging_level;
IF OBJECT_ID('dbo.packaging_hierarchy', 'U') IS NOT NULL DROP TABLE dbo.packaging_hierarchy;
IF OBJECT_ID('dbo.label_templates', 'U') IS NOT NULL DROP TABLE dbo.label_templates;
IF OBJECT_ID('dbo.materials', 'U') IS NOT NULL DROP TABLE dbo.materials;
IF OBJECT_ID('dbo.locations', 'U') IS NOT NULL DROP TABLE dbo.locations;
IF OBJECT_ID('dbo.master_definitions', 'U') IS NOT NULL DROP TABLE dbo.master_definitions;
GO

-- ===================================================================================
-- 1. Table Definitions
-- ===================================================================================

-- Master Definitions (Lookups)
CREATE TABLE dbo.master_definitions (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    def_type NVARCHAR(50) NOT NULL,
    def_value NVARCHAR(50) NOT NULL,
    description NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT UQ_master_definitions_type_value UNIQUE (def_type, def_value)
);
GO

-- Locations
CREATE TABLE dbo.locations (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    code NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(50), -- e.g., WAREHOUSE, ZONE, RACK, BIN
    category NVARCHAR(50), -- e.g., GENERAL, COLD_CHAIN
    parent_id UNIQUEIDENTIFIER NULL,
    address_line1 NVARCHAR(255),
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_locations_parent FOREIGN KEY (parent_id) REFERENCES dbo.locations(id)
);
GO

-- Materials
CREATE TABLE dbo.materials (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    code NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    type NVARCHAR(50), -- e.g., RAW, SEMI, FIN
    category NVARCHAR(50), -- e.g., ELECTRONICS, MECHANICAL
    base_uom NVARCHAR(10),
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    is_batch_managed BIT DEFAULT 0,
    is_serial_managed BIT DEFAULT 0,
    shelf_life_days INT,
    min_stock DECIMAL(18, 2),
    max_stock DECIMAL(18, 2),
    gross_weight DECIMAL(18, 2),
    net_weight DECIMAL(18, 2),
    weight_uom NVARCHAR(10),
    length DECIMAL(18, 2),
    width DECIMAL(18, 2),
    height DECIMAL(18, 2),
    dimension_uom NVARCHAR(10),
    is_hazmat BIT DEFAULT 0,
    hazmat_class NVARCHAR(50),
    un_number NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Label Templates
CREATE TABLE dbo.label_templates (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    content NVARCHAR(MAX), -- ZPL or HTML content
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Packaging Hierarchy
CREATE TABLE dbo.packaging_hierarchy (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Packaging Levels
CREATE TABLE dbo.packaging_level (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    hierarchy_id UNIQUEIDENTIFIER NOT NULL,
    level_order INT NOT NULL,
    level_name NVARCHAR(50) NOT NULL,
    label_template_id UNIQUEIDENTIFIER NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_packaging_level_hierarchy FOREIGN KEY (hierarchy_id) REFERENCES dbo.packaging_hierarchy(id),
    CONSTRAINT FK_packaging_level_template FOREIGN KEY (label_template_id) REFERENCES dbo.label_templates(id)
);
GO

-- Inventory (Individual Items)
CREATE TABLE dbo.inventory (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    material_id UNIQUEIDENTIFIER NOT NULL,
    serial_number NVARCHAR(100) NOT NULL UNIQUE,
    batch_number NVARCHAR(50),
    status NVARCHAR(50) DEFAULT 'PRE_INVENTORY', -- PRE_INVENTORY, ACTIVE, etc.
    quality_status NVARCHAR(50) DEFAULT 'PENDING',
    location_id UNIQUEIDENTIFIER NULL,
    scan_location_id UNIQUEIDENTIFIER NULL, -- Last point of scan
    manufactured_at DATETIME2,
    expires_at DATETIME2,
    confirmed_at DATETIME2,
    confirmed_by NVARCHAR(100),
    parent_container_type NVARCHAR(50),
    parent_container_id UNIQUEIDENTIFIER,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_inventory_material FOREIGN KEY (material_id) REFERENCES dbo.materials(id),
    CONSTRAINT FK_inventory_location FOREIGN KEY (location_id) REFERENCES dbo.locations(id)
);
GO

-- Serial Number Pool (For pre-generation)
CREATE TABLE dbo.serial_number_pool (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    material_id UNIQUEIDENTIFIER NOT NULL,
    batch_number NVARCHAR(50),
    serial_number NVARCHAR(100) NOT NULL UNIQUE,
    status NVARCHAR(20) DEFAULT 'RESERVED', -- RESERVED, CONSUMED, VOIDED
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_serial_pool_material FOREIGN KEY (material_id) REFERENCES dbo.materials(id)
);
GO

-- Container Units (Pallets, Boxes, etc.)
CREATE TABLE dbo.container_unit (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    code NVARCHAR(50),
    serial_number NVARCHAR(100) NOT NULL UNIQUE, -- SSCC or similar
    container_type NVARCHAR(50), -- PALLET, BOX
    location_id UNIQUEIDENTIFIER NULL,
    status NVARCHAR(50) DEFAULT 'OPEN', -- OPEN, SEALED, SHIPPED
    sealed_at DATETIME2,
    packaging_level_id UNIQUEIDENTIFIER NULL,
    created_by NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_container_location FOREIGN KEY (location_id) REFERENCES dbo.locations(id),
    CONSTRAINT FK_container_packaging_level FOREIGN KEY (packaging_level_id) REFERENCES dbo.packaging_level(id)
);
GO

-- Aggregation (Parent-Child Relationships)
CREATE TABLE dbo.aggregation (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    parent_type NVARCHAR(50) NOT NULL, -- CONTAINER
    parent_id UNIQUEIDENTIFIER NOT NULL,
    child_type NVARCHAR(50) NOT NULL, -- INVENTORY or CONTAINER
    child_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(20) DEFAULT 'ACTIVE',
    aggregated_at DATETIME2 DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    CONSTRAINT FK_aggregation_parent FOREIGN KEY (parent_id) REFERENCES dbo.container_unit(id)
    -- Child FK cannot be enforced simply due to polymorphic relationship (child_id can be inventory or container)
);
GO

-- Trace Events (Audit Trail)
CREATE TABLE dbo.trace_event (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    event_type NVARCHAR(50) NOT NULL,
    serial_number NVARCHAR(100) NOT NULL, -- Could be item or container serial
    description NVARCHAR(MAX),
    location_id UNIQUEIDENTIFIER NULL,
    data NVARCHAR(MAX), -- JSON data
    created_by NVARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_trace_event_location FOREIGN KEY (location_id) REFERENCES dbo.locations(id)
);
GO

-- ===================================================================================
-- 2. Seed Data
-- ===================================================================================

-- Master Definitions
INSERT INTO dbo.master_definitions (def_type, def_value, description) VALUES
('MATERIAL_TYPE', 'RAW', 'Raw Material'),
('MATERIAL_TYPE', 'SEMI', 'Semi-Finished'),
('MATERIAL_TYPE', 'FIN', 'Finished Goods'),
('MATERIAL_CAT', 'ELECTRONICS', 'Electronics'),
('MATERIAL_CAT', 'MECHANICAL', 'Mechanical'),
('MATERIAL_CAT', 'CHEMICAL', 'Chemical'),
('LOCATION_TYPE', 'WAREHOUSE', 'Warehouse'),
('LOCATION_TYPE', 'ZONE', 'Zone'),
('LOCATION_TYPE', 'RACK', 'Rack'),
('LOCATION_TYPE', 'BIN', 'Bin'),
('LOCATION_CAT', 'GENERAL', 'General'),
('LOCATION_CAT', 'COLD_CHAIN', 'Cold Chain');
GO

-- Materials
INSERT INTO dbo.materials (id, code, name, description, type, category, base_uom, status, is_batch_managed, min_stock, gross_weight)
VALUES 
('123e4567-e89b-12d3-a456-426614174001', 'MAT-001', 'Steel Sheet 2mm', 'High grade steel sheet', 'RAW', 'MECHANICAL', 'KG', 'ACTIVE', 1, 500, 10);

INSERT INTO dbo.materials (id, code, name, description, type, category, base_uom, status, is_serial_managed, shelf_life_days)
VALUES 
('123e4567-e89b-12d3-a456-426614174002', 'PROD-Phone-X', 'Smartphone Model X', 'Flagship smartphone', 'FIN', 'ELECTRONICS', 'EA', 'ACTIVE', 1, 730);
GO

-- Locations
INSERT INTO dbo.locations (id, code, name, type, category, status, address_line1)
VALUES 
('123e4567-e89b-12d3-a456-426614174100', 'WH-MAIN', 'Main Warehouse', 'WAREHOUSE', 'GENERAL', 'ACTIVE', '123 Logistics Blvd');

INSERT INTO dbo.locations (id, code, name, type, category, parent_id, status)
VALUES 
('123e4567-e89b-12d3-a456-426614174101', 'ZN-A', 'Zone A', 'ZONE', 'GENERAL', '123e4567-e89b-12d3-a456-426614174100', 'ACTIVE');
GO

-- ===================================================================================
-- 3. Stored Procedures (Bubs/Placeholders for Logic)
-- ===================================================================================

CREATE PROCEDURE dbo.sp_ReserveSerialNumbers
    @p_material_id UNIQUEIDENTIFIER,
    @p_batch_number NVARCHAR(50),
    @p_quantity INT,
    @p_created_by NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @i INT = 0;
    WHILE @i < @p_quantity
    BEGIN
        INSERT INTO dbo.serial_number_pool (material_id, batch_number, serial_number, status)
        VALUES (@p_material_id, @p_batch_number, CAST(NEWID() AS NVARCHAR(50)), 'RESERVED');
        SET @i = @i + 1;
    END
END;
GO

CREATE PROCEDURE dbo.sp_PackItems
    @p_parent_id UNIQUEIDENTIFIER,
    @p_child_type NVARCHAR(50),
    @p_child_ids NVARCHAR(MAX),
    @p_created_by NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.aggregation (parent_type, parent_id, child_type, child_id, status, created_by)
    SELECT 'CONTAINER', @p_parent_id, @p_child_type, value, 'ACTIVE', @p_created_by
    FROM STRING_SPLIT(@p_child_ids, ',');
END;
GO

-- ===================================================================================
-- End of Script
-- ===================================================================================
