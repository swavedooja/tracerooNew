package com.ilms.backend.service;

import com.ilms.backend.entity.ContainerUnit;
import com.ilms.backend.entity.Inventory;
import com.ilms.backend.entity.TraceEvent;
import com.ilms.backend.repository.ContainerUnitRepository;
import com.ilms.backend.repository.InventoryRepository;
import com.ilms.backend.repository.TraceEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class TraceService {
    private final TraceEventRepository eventRepo;
    private final InventoryRepository inventoryRepo;
    private final ContainerUnitRepository containerRepo;

    public TraceService(TraceEventRepository eventRepo, InventoryRepository inventoryRepo,
            ContainerUnitRepository containerRepo) {
        this.eventRepo = eventRepo;
        this.inventoryRepo = inventoryRepo;
        this.containerRepo = containerRepo;
    }

    public List<TraceEvent> getHistory(String serialNumber) {
        Optional<Inventory> inv = inventoryRepo.findBySerialNumber(serialNumber);
        if (inv.isPresent()) {
            return eventRepo.findByInventoryIdOrderByTimestampDesc(inv.get().getId());
        }
        Optional<ContainerUnit> cont = containerRepo.findBySerialNumber(serialNumber);
        if (cont.isPresent()) {
            return eventRepo.findByContainerIdOrderByTimestampDesc(cont.get().getId());
        }
        return Collections.emptyList();
    }

    @Transactional
    public TraceEvent recordEvent(TraceEvent event) {
        return eventRepo.save(event);
    }
}
