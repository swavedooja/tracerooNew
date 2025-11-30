package com.ilms.backend.supabase.repository;

import com.ilms.backend.supabase.entity.SupabasePackagingHierarchy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupabasePackagingHierarchyRepository extends JpaRepository<SupabasePackagingHierarchy, Long> {
    List<SupabasePackagingHierarchy> findByNameContainingIgnoreCase(String name);
}