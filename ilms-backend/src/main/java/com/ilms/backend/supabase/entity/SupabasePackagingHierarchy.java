package com.ilms.backend.supabase.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "packaging_hierarchy")
@Getter
@Setter
public class SupabasePackagingHierarchy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(name = "activation_from")
    private LocalDate activationFrom;
    @Column(name = "activation_to")
    private LocalDate activationTo;
    @Column(name = "packaging_capacity_constraints")
    private Boolean packagingCapacityConstraints;
    @Column(name = "gtin_assignment_format")
    private String gtinAssignmentFormat;
    private String description;
}