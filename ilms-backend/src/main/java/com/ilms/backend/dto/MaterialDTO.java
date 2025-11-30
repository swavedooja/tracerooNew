package com.ilms.backend.dto;

import com.ilms.backend.entity.HandlingParameter;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MaterialDTO {
    @NotBlank
    private String materialCode;
    @NotBlank
    private String materialName;
    private String description;
    private String sku;
    private String eanGtIN;
    private String upc;
    private String countryOfOrigin;
    private String type;
    private String materialClass;
    private String materialGroup;
    private String gs1CategoryCode;
    private Integer shelfLifeDays;
    private String shelfLifeUom;
    private String storageType;
    private String procurementType;
    private String baseUOM;
    private Double netWeightKg;
    private String dimensionsMM;
    private String tradeUOM;
    private Double tradeWeightKg;
    private String tradeDimensionsMM;
    private Boolean isPackaged;
    private Boolean isMilitaryGrade;
    private Boolean isFragile;
    private Boolean isEnvSensitive;
    private Boolean isHighValue;
    private Boolean isHazardous;
    private Boolean isBatchManaged;
    private String packagingMaterialCode;
    private Boolean isSerialized;
    private Boolean isRfidCapable;
    private String externalERPCode;
    private String itemWeight;
    private String itemDimension;
    private String maxStoragePeriod;
    private String materialEANupc;

    private HandlingParameter handlingParameter;
}
