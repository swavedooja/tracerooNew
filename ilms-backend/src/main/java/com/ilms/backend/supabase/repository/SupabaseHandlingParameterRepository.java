package com.ilms.backend.supabase.repository;

import com.ilms.backend.supabase.entity.SupabaseHandlingParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupabaseHandlingParameterRepository extends JpaRepository<SupabaseHandlingParameter, Long> {
    Optional<SupabaseHandlingParameter> findByMaterialCode(String materialCode);
}