package com.ilms.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "material_master")
@Getter
@Setter
public class MaterialMaster {
    @Id
    @Column(name = "material_code", nullable = false, unique = true)
    private String materialCode;

    @NotBlank
    @Column(name = "material_name")
    private String materialName;

    private String description;
    private String sku;
    @Column(name = "ean_gtin")
    private String eanGtIN;
    private String upc;
    private String countryOfOrigin;
    private String type;
    @Column(name = "material_class")
    private String materialClass;
    @Column(name = "material_group")
    private String materialGroup;
    @Column(name = "gs1_category_code")
    private String gs1CategoryCode;
    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;
    @Column(name = "shelf_life_uom")
    private String shelfLifeUom;
    @Column(name = "storage_type")
    private String storageType;
    @Column(name = "procurement_type")
    private String procurementType;
    @Column(name = "baseuom")
    private String baseUOM;
    @Column(name = "net_weight_kg")
    private Double netWeightKg;
    @Column(name = "dimensionsmm") // LxWxH
    private String dimensionsMM; // LxWxH
    @Column(name = "tradeuom")
    private String tradeUOM;
    @Column(name = "trade_weight_kg")
    private Double tradeWeightKg;
    @Column(name = "trade_dimensionsmm")
    private String tradeDimensionsMM;
    private Boolean isPackaged;
    private Boolean isMilitaryGrade;
    private Boolean isFragile;
    private Boolean isEnvSensitive;
    private Boolean isHighValue;
    private Boolean isHazardous;
    private Boolean isBatchManaged;
    @Column(name = "packaging_material_code")
    private String packagingMaterialCode;
    private Boolean isSerialized;
    private Boolean isRfidCapable;
    @Column(name = "externalerpcode")
    private String externalERPCode;
    private String itemWeight;
    private String itemDimension;
    private String maxStoragePeriod;
    @Column(name = "material_eanupc")
    private String materialEANupc;

    @OneToOne(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private HandlingParameter handlingParameter;
}
