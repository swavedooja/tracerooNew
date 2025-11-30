package com.ilms.backend.repository;

import com.ilms.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findBySerialNumber(String serialNumber);

    List<Inventory> findByBatchNumber(String batchNumber);
}
