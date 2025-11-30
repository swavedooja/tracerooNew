package com.ilms.backend.supabase.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "material_master")
@Getter
@Setter
public class SupabaseMaterialMaster {
    @Id
    @Column(name = "material_code", nullable = false, unique = true)
    private String materialCode;

    @Column(name = "material_name")
    private String materialName;

    private String description;
    private String sku;
    @Column(name = "ean_gtin")
    private String eanGtIN;
    private String upc;
    @Column(name = "country_of_origin")
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
    @Column(name = "dimensionsmm")
    private String dimensionsMM;
    @Column(name = "tradeuom")
    private String tradeUOM;
    @Column(name = "trade_weight_kg")
    private Double tradeWeightKg;
    @Column(name = "trade_dimensionsmm")
    private String tradeDimensionsMM;
    @Column(name = "is_packaged")
    private Boolean isPackaged;
    @Column(name = "is_military_grade")
    private Boolean isMilitaryGrade;
    @Column(name = "is_fragile")
    private Boolean isFragile;
    @Column(name = "is_env_sensitive")
    private Boolean isEnvSensitive;
    @Column(name = "is_high_value")
    private Boolean isHighValue;
    @Column(name = "is_hazardous")
    private Boolean isHazardous;
    @Column(name = "is_batch_managed")
    private Boolean isBatchManaged;
    @Column(name = "packaging_material_code")
    private String packagingMaterialCode;
    @Column(name = "is_serialized")
    private Boolean isSerialized;
    @Column(name = "is_rfid_capable")
    private Boolean isRfidCapable;
    @Column(name = "externalerpcode")
    private String externalERPCode;
    @Column(name = "item_weight")
    private String itemWeight;
    @Column(name = "item_dimension")
    private String itemDimension;
    @Column(name = "max_storage_period")
    private String maxStoragePeriod;
    @Column(name = "material_eanupc")
    private String materialEANupc;
    
    // Additional setter methods to match SQLite entity naming
    public void setPackaged(Boolean isPackaged) {
        this.isPackaged = isPackaged;
    }
    
    public void setFragile(Boolean isFragile) {
        this.isFragile = isFragile;
    }
    
    public void setEnvSensitive(Boolean isEnvSensitive) {
        this.isEnvSensitive = isEnvSensitive;
    }
    
    public void setHighValue(Boolean isHighValue) {
        this.isHighValue = isHighValue;
    }
    
    public void setBatchManaged(Boolean isBatchManaged) {
        this.isBatchManaged = isBatchManaged;
    }
    
    public void setSerialized(Boolean isSerialized) {
        this.isSerialized = isSerialized;
    }
}