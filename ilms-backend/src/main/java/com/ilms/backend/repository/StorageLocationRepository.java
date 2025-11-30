package com.ilms.backend.repository;

import com.ilms.backend.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StorageLocationRepository extends JpaRepository<StorageLocation, Long> {
}
