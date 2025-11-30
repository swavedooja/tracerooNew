package com.ilms.backend.supabase.repository;

import com.ilms.backend.supabase.entity.SupabaseMaterialImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupabaseMaterialImageRepository extends JpaRepository<SupabaseMaterialImage, Long> {
    List<SupabaseMaterialImage> findByMaterialCode(String materialCode);
}