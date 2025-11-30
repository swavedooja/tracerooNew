package com.ilms.backend.repository;

import com.ilms.backend.entity.ContainerUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ContainerUnitRepository extends JpaRepository<ContainerUnit, Long> {
    Optional<ContainerUnit> findBySerialNumber(String serialNumber);
}
