package com.ilms.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "storage_location")
@Getter
@Setter
public class StorageLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "location_code")
    private String locationCode; // e.g., A-01-01

    private String description;
    private String type; // e.g., Rack, Bin, Floor

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_code")
    @JsonIgnore
    private Warehouse warehouse;
}
