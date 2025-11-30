package com.ilms.backend.supabase.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "packaging_level")
@Getter
@Setter
public class SupabasePackagingLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hierarchy_id")
    private Long hierarchyId;

    @Column(name = "level_index")
    private Integer levelIndex;

    @Column(name = "level_code")
    private String levelCode;

    @Column(name = "level_name")
    private String levelName;

    @Column(name = "contained_quantity")
    private Integer containedQuantity;

    @Column(name = "dimensionsmm")
    private String dimensionsMM;

    @Column(name = "weightkg")
    private Double weightKg;

    @Column(name = "capacity_units")
    private String capacityUnits;

    @Column(name = "id_tech")
    private String idTech;

    @Column(name = "barcode_type")
    private String barcodeType;

    @Column(name = "rfid_tag_type")
    private String rfidTagType;

    @Column(name = "epc_format")
    private String epcFormat;

    @Column(name = "label_template")
    private String labelTemplate;

    @Column(name = "gtin_format")
    private String gtinFormat;

    @Column(name = "default_label_copies")
    private Integer defaultLabelCopies;

    @Column(name = "is_returnable")
    private Boolean isReturnable;

    @Column(name = "is_serialized")
    private Boolean isSerialized;
    
    // Additional setter methods to match SQLite entity naming
    public void setReturnable(Boolean isReturnable) {
        this.isReturnable = isReturnable;
    }
    
    public void setSerialized(Boolean isSerialized) {
        this.isSerialized = isSerialized;
    }
}