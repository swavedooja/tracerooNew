package com.ilms.backend.controller;

import com.ilms.backend.entity.Box;
import com.ilms.backend.entity.Inventory;
import com.ilms.backend.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {
    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Inventory> list() {
        return service.list();
    }

    @PostMapping("/register-batch")
    public List<Inventory> registerBatch(@RequestBody Map<String, Object> payload) {
        String materialCode = (String) payload.get("materialCode");
        String batchNumber = (String) payload.get("batchNumber");
        int quantity = (Integer) payload.get("quantity");
        return service.registerBatch(materialCode, batchNumber, quantity);
    }

    @PostMapping("/pack-box")
    public Box packBox(@RequestBody Map<String, Object> payload) {
        List<Long> inventoryIds = ((List<?>) payload.get("inventoryIds")).stream()
                .map(id -> ((Number) id).longValue())
                .toList();
        String boxSerial = (String) payload.get("boxSerial");
        return service.packItemsIntoBox(inventoryIds, boxSerial);
    }
}
