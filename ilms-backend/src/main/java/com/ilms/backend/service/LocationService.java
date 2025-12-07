package com.ilms.backend.service;

import com.ilms.backend.entity.StorageLocation;
import com.ilms.backend.entity.Warehouse;
import com.ilms.backend.repository.StorageLocationRepository;
import com.ilms.backend.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {
    private final WarehouseRepository warehouseRepo;
    private final StorageLocationRepository locationRepo;

    public WarehouseService(WarehouseRepository warehouseRepo, StorageLocationRepository locationRepo) {
        this.warehouseRepo = warehouseRepo;
        this.locationRepo = locationRepo;
    }

    public List<Warehouse> list() {
        return warehouseRepo.findAll();
    }

    public Optional<Warehouse> get(String code) {
        return warehouseRepo.findById(code);
    }

    @Transactional
    public Warehouse save(Warehouse warehouse) {
        // Ensure bidirectional relationship
        if (warehouse.getStorageLocations() != null) {
            for (StorageLocation loc : warehouse.getStorageLocations()) {
                loc.setWarehouse(warehouse);
            }
        }
        return warehouseRepo.save(warehouse);
    }

    public void delete(String code) {
        warehouseRepo.deleteById(code);
    }
}
