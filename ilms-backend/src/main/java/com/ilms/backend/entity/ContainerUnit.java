package com.ilms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "container_unit")
@Getter
@Setter
public abstract class ContainerUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "serial_number", unique = true, nullable = false)
    private String serialNumber;

    private String status; // EMPTY, PARTIAL, FULL, SHIPPED

    @ManyToOne
    @JoinColumn(name = "warehouse_code")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private StorageLocation location;

    // Parent container (e.g. Box inside Pallet)
    @ManyToOne
    @JoinColumn(name = "parent_container_id")
    private ContainerUnit parentContainer;
}
