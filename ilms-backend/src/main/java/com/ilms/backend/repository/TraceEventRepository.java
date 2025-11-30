package com.ilms.backend.repository;

import com.ilms.backend.entity.TraceEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TraceEventRepository extends JpaRepository<TraceEvent, Long> {
    List<TraceEvent> findByInventoryIdOrderByTimestampDesc(Long inventoryId);

    List<TraceEvent> findByContainerIdOrderByTimestampDesc(Long containerId);
}
