package com.ilms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Getter
@Setter
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "material_code", nullable = false)
    private MaterialMaster material;

    @Column(name = "serial_number", unique = true)
    private String serialNumber;

    @Column(name = "batch_number")
    private String batchNumber;

    private String status; // REGISTERED, PACKED, SHIPPED, CONSUMED

    @ManyToOne
    @JoinColumn(name = "warehouse_code")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private StorageLocation location;

    @ManyToOne
    @JoinColumn(name = "box_id")
    private Box box; // Parent box

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
