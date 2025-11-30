package com.ilms.backend.supabase.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "material_image")
@Getter
@Setter
public class SupabaseMaterialImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_code")
    private String materialCode;

    private String type;
    private String filename;
    private String url;
}