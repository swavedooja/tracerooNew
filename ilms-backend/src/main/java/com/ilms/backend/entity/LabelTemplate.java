package com.ilms.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "label_template")
@Getter
@Setter
public class LabelTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(name = "level_name")
    private String levelName; // ITEM, BOX, PALLET, CONTAINER

    @Column(name = "width_mm")
    private Double widthMm;

    @Column(name = "height_mm")
    private Double heightMm;

    @Column(columnDefinition = "TEXT")
    private String layoutJson; // JSON string of elements

    private String status; // DRAFT, ACTIVE, RETIRED

    @ManyToOne
    @JoinColumn(name = "material_code")
    private MaterialMaster material; // Optional: specific to a material
}
