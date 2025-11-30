package com.ilms.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "warehouse")
@Getter
@Setter
public class Warehouse {
    @Id
    @Column(name = "warehouse_code", nullable = false, unique = true)
    private String warehouseCode;

    @NotBlank
    @Column(name = "warehouse_name")
    private String warehouseName;

    private String location;
    private String type; // e.g., Manufacturing, Distribution Center

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StorageLocation> storageLocations;
}
