package com.ilms.backend.service;

import com.ilms.backend.entity.*;
import com.ilms.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InventoryService {
    private final InventoryRepository inventoryRepo;
    private final ContainerUnitRepository containerRepo;
    private final MaterialMasterRepository materialRepo;

    public InventoryService(InventoryRepository inventoryRepo, ContainerUnitRepository containerRepo,
            MaterialMasterRepository materialRepo) {
        this.inventoryRepo = inventoryRepo;
        this.containerRepo = containerRepo;
        this.materialRepo = materialRepo;
    }

    public List<Inventory> list() {
        return inventoryRepo.findAll();
    }

    @Transactional
    public List<Inventory> registerBatch(String materialCode, String batchNumber, int quantity) {
        MaterialMaster material = materialRepo.findById(materialCode)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        List<Inventory> items = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            Inventory item = new Inventory();
            item.setMaterial(material);
            item.setBatchNumber(batchNumber);
            item.setSerialNumber(UUID.randomUUID().toString()); // Simple UUID for now
            item.setStatus("REGISTERED");
            items.add(item);
        }
        return inventoryRepo.saveAll(items);
    }

    @Transactional
    public Box packItemsIntoBox(List<Long> inventoryIds, String boxSerial) {
        Box box = new Box();
        box.setSerialNumber(boxSerial);
        box.setStatus("FULL");
        box.setItemCount(inventoryIds.size());
        box = (Box) containerRepo.save(box);

        List<Inventory> items = inventoryRepo.findAllById(inventoryIds);
        for (Inventory item : items) {
            item.setBox(box);
            item.setStatus("PACKED");
        }
        inventoryRepo.saveAll(items);
        return box;
    }
}
