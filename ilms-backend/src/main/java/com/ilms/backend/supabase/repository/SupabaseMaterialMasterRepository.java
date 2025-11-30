package com.ilms.backend.supabase.repository;

import com.ilms.backend.supabase.entity.SupabaseMaterialMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupabaseMaterialMasterRepository extends JpaRepository<SupabaseMaterialMaster, String> {
    List<SupabaseMaterialMaster> findByMaterialNameContainingIgnoreCase(String materialName);
    List<SupabaseMaterialMaster> findByMaterialGroup(String materialGroup);
}