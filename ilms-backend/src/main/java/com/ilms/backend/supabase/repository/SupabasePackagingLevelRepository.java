package com.ilms.backend.supabase.repository;

import com.ilms.backend.supabase.entity.SupabasePackagingLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupabasePackagingLevelRepository extends JpaRepository<SupabasePackagingLevel, Long> {
    List<SupabasePackagingLevel> findByHierarchyId(Long hierarchyId);
    List<SupabasePackagingLevel> findByHierarchyIdOrderByLevelIndexAsc(Long hierarchyId);
}