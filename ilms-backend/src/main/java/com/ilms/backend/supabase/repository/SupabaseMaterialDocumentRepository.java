package com.ilms.backend.supabase.repository;

import com.ilms.backend.supabase.entity.SupabaseMaterialDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupabaseMaterialDocumentRepository extends JpaRepository<SupabaseMaterialDocument, Long> {
    List<SupabaseMaterialDocument> findByMaterialCode(String materialCode);
}