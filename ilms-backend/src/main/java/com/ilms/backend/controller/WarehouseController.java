package com.ilms.backend.controller;

import com.ilms.backend.entity.Warehouse;
import com.ilms.backend.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "*")
public class WarehouseController {
    private final WarehouseService service;

    public WarehouseController(WarehouseService service) {
        this.service = service;
    }

    @GetMapping
    public List<Warehouse> list() {
        return service.list();
    }

    @GetMapping("/{code}")
    public ResponseEntity<Warehouse> get(@PathVariable String code) {
        return service.get(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Warehouse create(@RequestBody Warehouse warehouse) {
        return service.save(warehouse);
    }

    @PutMapping("/{code}")
    public ResponseEntity<Warehouse> update(@PathVariable String code, @RequestBody Warehouse warehouse) {
        if (!service.get(code).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        warehouse.setWarehouseCode(code);
        return ResponseEntity.ok(service.save(warehouse));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
        service.delete(code);
        return ResponseEntity.noContent().build();
    }
}
