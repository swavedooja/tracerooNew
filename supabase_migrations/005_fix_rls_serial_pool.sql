-- =====================================================
-- TraceRoo Phase 5: Fix RLS Policy for Serial Number Pool
-- Run this in Supabase SQL Editor
-- =====================================================

-- The reserve_serial_numbers function was causing RLS violations
-- because it uses SECURITY INVOKER by default. We need to change it
-- to SECURITY DEFINER so it can insert regardless of the calling user.

-- Drop and recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION reserve_serial_numbers(
    p_material_id UUID,
    p_batch_number TEXT,
    p_quantity INT,
    p_created_by TEXT DEFAULT NULL
)
RETURNS TABLE(serial_number TEXT, id BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
AS $$
DECLARE
    v_date_part TEXT;
    v_start_sequence INT;
    v_i INT;
    v_serial TEXT;
BEGIN
    -- Get current date in DDMMYYYY format
    v_date_part := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
    
    -- Get the next starting sequence number
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(snp.serial_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO v_start_sequence
    FROM serial_number_pool snp
    WHERE snp.material_id = p_material_id
    AND snp.serial_number LIKE 'SN-' || v_date_part || '-%';
    
    -- Insert each serial number
    FOR v_i IN 0..(p_quantity - 1) LOOP
        v_serial := 'SN-' || v_date_part || '-' || LPAD((v_start_sequence + v_i)::TEXT, 5, '0');
        
        INSERT INTO serial_number_pool (material_id, batch_number, serial_number, status, created_by)
        VALUES (p_material_id, p_batch_number, v_serial, 'RESERVED', p_created_by)
        RETURNING serial_number_pool.serial_number, serial_number_pool.id
        INTO serial_number, id;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Also update generate_serial_number to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION generate_serial_number(
    p_material_id UUID,
    p_batch_number TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_date_part TEXT;
    v_sequence INT;
    v_serial TEXT;
BEGIN
    -- Get current date in DDMMYYYY format
    v_date_part := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
    
    -- Get the next sequence number for this material and date
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(serial_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM serial_number_pool
    WHERE material_id = p_material_id
    AND serial_number LIKE 'SN-' || v_date_part || '-%';
    
    -- Format serial number with 5-digit sequence
    v_serial := 'SN-' || v_date_part || '-' || LPAD(v_sequence::TEXT, 5, '0');
    
    RETURN v_serial;
END;
$$;

-- Add policy for anon users to insert via functions (as backup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'serial_number_pool' 
        AND policyname = 'Enable insert for anon'
    ) THEN
        CREATE POLICY "Enable insert for anon" ON serial_number_pool
            FOR INSERT
            TO anon
            WITH CHECK (true);
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
