package com.ilms.backend.supabase.service;

import com.ilms.backend.entity.*;
import com.ilms.backend.repository.*;
import com.ilms.backend.supabase.entity.*;
import com.ilms.backend.supabase.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupabaseSyncService {

    @Autowired
    private MaterialMasterRepository sqliteMaterialMasterRepository;

    @Autowired
    private HandlingParameterRepository sqliteHandlingParameterRepository;

    @Autowired
    private MaterialImageRepository sqliteMaterialImageRepository;

    @Autowired
    private MaterialDocumentRepository sqliteMaterialDocumentRepository;

    @Autowired
    private PackagingHierarchyRepository sqlitePackagingHierarchyRepository;

    @Autowired
    private PackagingLevelRepository sqlitePackagingLevelRepository;

    @Autowired
    private SupabaseMaterialMasterRepository supabaseMaterialMasterRepository;

    @Autowired
    private SupabaseHandlingParameterRepository supabaseHandlingParameterRepository;

    @Autowired
    private SupabaseMaterialImageRepository supabaseMaterialImageRepository;

    @Autowired
    private SupabaseMaterialDocumentRepository supabaseMaterialDocumentRepository;

    @Autowired
    private SupabasePackagingHierarchyRepository supabasePackagingHierarchyRepository;

    @Autowired
    private SupabasePackagingLevelRepository supabasePackagingLevelRepository;

    // Sync all data from SQLite to Supabase
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void syncDataToSupabase() {
        syncMaterialMasterData();
        syncHandlingParameterData();
        syncMaterialImageData();
        syncMaterialDocumentData();
        syncPackagingHierarchyData();
        syncPackagingLevelData();
    }

    private void syncMaterialMasterData() {
        List<MaterialMaster> sqliteMaterials = sqliteMaterialMasterRepository.findAll();
        
        for (MaterialMaster sqliteMaterial : sqliteMaterials) {
            Optional<SupabaseMaterialMaster> existingSupabaseMaterial = 
                supabaseMaterialMasterRepository.findById(sqliteMaterial.getMaterialCode());
            
            SupabaseMaterialMaster supabaseMaterial;
            if (existingSupabaseMaterial.isPresent()) {
                supabaseMaterial = existingSupabaseMaterial.get();
            } else {
                supabaseMaterial = new SupabaseMaterialMaster();
                supabaseMaterial.setMaterialCode(sqliteMaterial.getMaterialCode());
            }
            
            // Copy all fields
            supabaseMaterial.setMaterialName(sqliteMaterial.getMaterialName());
            supabaseMaterial.setDescription(sqliteMaterial.getDescription());
            supabaseMaterial.setSku(sqliteMaterial.getSku());
            supabaseMaterial.setEanGtIN(sqliteMaterial.getEanGtIN());
            supabaseMaterial.setUpc(sqliteMaterial.getUpc());
            supabaseMaterial.setCountryOfOrigin(sqliteMaterial.getCountryOfOrigin());
            supabaseMaterial.setType(sqliteMaterial.getType());
            supabaseMaterial.setMaterialClass(sqliteMaterial.getMaterialClass());
            supabaseMaterial.setMaterialGroup(sqliteMaterial.getMaterialGroup());
            supabaseMaterial.setGs1CategoryCode(sqliteMaterial.getGs1CategoryCode());
            supabaseMaterial.setShelfLifeDays(sqliteMaterial.getShelfLifeDays());
            supabaseMaterial.setStorageType(sqliteMaterial.getStorageType());
            supabaseMaterial.setProcurementType(sqliteMaterial.getProcurementType());
            supabaseMaterial.setBaseUOM(sqliteMaterial.getBaseUOM());
            supabaseMaterial.setNetWeightKg(sqliteMaterial.getNetWeightKg());
            supabaseMaterial.setDimensionsMM(sqliteMaterial.getDimensionsMM());
            supabaseMaterial.setTradeUOM(sqliteMaterial.getTradeUOM());
            supabaseMaterial.setTradeWeightKg(sqliteMaterial.getTradeWeightKg());
            supabaseMaterial.setTradeDimensionsMM(sqliteMaterial.getTradeDimensionsMM());
            supabaseMaterial.setPackaged(sqliteMaterial.getIsPackaged());
            supabaseMaterial.setFragile(sqliteMaterial.getIsFragile());
            supabaseMaterial.setEnvSensitive(sqliteMaterial.getIsEnvSensitive());
            supabaseMaterial.setHighValue(sqliteMaterial.getIsHighValue());
            supabaseMaterial.setBatchManaged(sqliteMaterial.getIsBatchManaged());
            supabaseMaterial.setPackagingMaterialCode(sqliteMaterial.getPackagingMaterialCode());
            supabaseMaterial.setSerialized(sqliteMaterial.getIsSerialized());
            supabaseMaterial.setExternalERPCode(sqliteMaterial.getExternalERPCode());
            supabaseMaterial.setItemWeight(sqliteMaterial.getItemWeight());
            supabaseMaterial.setItemDimension(sqliteMaterial.getItemDimension());
            supabaseMaterial.setMaxStoragePeriod(sqliteMaterial.getMaxStoragePeriod());
            supabaseMaterial.setMaterialEANupc(sqliteMaterial.getMaterialEANupc());
            
            supabaseMaterialMasterRepository.save(supabaseMaterial);
        }
    }

    private void syncHandlingParameterData() {
        List<HandlingParameter> sqliteParams = sqliteHandlingParameterRepository.findAll();
        
        for (HandlingParameter sqliteParam : sqliteParams) {
            Optional<SupabaseHandlingParameter> existingSupabaseParam = 
                supabaseHandlingParameterRepository.findById(sqliteParam.getId());
            
            SupabaseHandlingParameter supabaseParam;
            if (existingSupabaseParam.isPresent()) {
                supabaseParam = existingSupabaseParam.get();
            } else {
                supabaseParam = new SupabaseHandlingParameter();
            }
            
            // Copy all fields
            supabaseParam.setMaterialCode(sqliteParam.getMaterial().getMaterialCode());
            supabaseParam.setTemperatureMin(sqliteParam.getTemperatureMin());
            supabaseParam.setTemperatureMax(sqliteParam.getTemperatureMax());
            supabaseParam.setHumidityMin(sqliteParam.getHumidityMin());
            supabaseParam.setHumidityMax(sqliteParam.getHumidityMax());
            supabaseParam.setHazardousClass(sqliteParam.getHazardousClass());
            supabaseParam.setPrecautions(sqliteParam.getPrecautions());
            supabaseParam.setEnvParameters(sqliteParam.getEnvParameters());
            supabaseParam.setEpcFormat(sqliteParam.getEpcFormat());
            
            supabaseHandlingParameterRepository.save(supabaseParam);
        }
    }

    private void syncMaterialImageData() {
        List<MaterialImage> sqliteImages = sqliteMaterialImageRepository.findAll();
        
        for (MaterialImage sqliteImage : sqliteImages) {
            Optional<SupabaseMaterialImage> existingSupabaseImage = 
                supabaseMaterialImageRepository.findById(sqliteImage.getId());
            
            SupabaseMaterialImage supabaseImage;
            if (existingSupabaseImage.isPresent()) {
                supabaseImage = existingSupabaseImage.get();
            } else {
                supabaseImage = new SupabaseMaterialImage();
            }
            
            // Copy all fields
            supabaseImage.setMaterialCode(sqliteImage.getMaterial().getMaterialCode());
            supabaseImage.setType(sqliteImage.getType());
            supabaseImage.setFilename(sqliteImage.getFilename());
            supabaseImage.setUrl(sqliteImage.getUrl());
            
            supabaseMaterialImageRepository.save(supabaseImage);
        }
    }

    private void syncMaterialDocumentData() {
        List<MaterialDocument> sqliteDocs = sqliteMaterialDocumentRepository.findAll();
        
        for (MaterialDocument sqliteDoc : sqliteDocs) {
            Optional<SupabaseMaterialDocument> existingSupabaseDoc = 
                supabaseMaterialDocumentRepository.findById(sqliteDoc.getId());
            
            SupabaseMaterialDocument supabaseDoc;
            if (existingSupabaseDoc.isPresent()) {
                supabaseDoc = existingSupabaseDoc.get();
            } else {
                supabaseDoc = new SupabaseMaterialDocument();
            }
            
            // Copy all fields
            supabaseDoc.setMaterialCode(sqliteDoc.getMaterial().getMaterialCode());
            supabaseDoc.setDocType(sqliteDoc.getDocType());
            supabaseDoc.setFilename(sqliteDoc.getFilename());
            supabaseDoc.setUrl(sqliteDoc.getUrl());
            
            supabaseMaterialDocumentRepository.save(supabaseDoc);
        }
    }

    private void syncPackagingHierarchyData() {
        List<PackagingHierarchy> sqliteHierarchies = sqlitePackagingHierarchyRepository.findAll();
        
        for (PackagingHierarchy sqliteHierarchy : sqliteHierarchies) {
            Optional<SupabasePackagingHierarchy> existingSupabaseHierarchy = 
                supabasePackagingHierarchyRepository.findById(sqliteHierarchy.getId());
            
            SupabasePackagingHierarchy supabaseHierarchy;
            if (existingSupabaseHierarchy.isPresent()) {
                supabaseHierarchy = existingSupabaseHierarchy.get();
            } else {
                supabaseHierarchy = new SupabasePackagingHierarchy();
            }
            
            // Copy all fields
            supabaseHierarchy.setName(sqliteHierarchy.getName());
            supabaseHierarchy.setActivationFrom(sqliteHierarchy.getActivationFrom());
            supabaseHierarchy.setActivationTo(sqliteHierarchy.getActivationTo());
            supabaseHierarchy.setPackagingCapacityConstraints(sqliteHierarchy.getPackagingCapacityConstraints());
            supabaseHierarchy.setGtinAssignmentFormat(sqliteHierarchy.getGtinAssignmentFormat());
            supabaseHierarchy.setDescription(sqliteHierarchy.getDescription());
            
            supabasePackagingHierarchyRepository.save(supabaseHierarchy);
        }
    }

    private void syncPackagingLevelData() {
        List<PackagingLevel> sqliteLevels = sqlitePackagingLevelRepository.findAll();
        
        for (PackagingLevel sqliteLevel : sqliteLevels) {
            Optional<SupabasePackagingLevel> existingSupabaseLevel = 
                supabasePackagingLevelRepository.findById(sqliteLevel.getId());
            
            SupabasePackagingLevel supabaseLevel;
            if (existingSupabaseLevel.isPresent()) {
                supabaseLevel = existingSupabaseLevel.get();
            } else {
                supabaseLevel = new SupabasePackagingLevel();
            }
            
            // Copy all fields
            supabaseLevel.setHierarchyId(sqliteLevel.getHierarchy().getId());
            supabaseLevel.setLevelIndex(sqliteLevel.getLevelIndex());
            supabaseLevel.setLevelCode(sqliteLevel.getLevelCode());
            supabaseLevel.setLevelName(sqliteLevel.getLevelName());
            supabaseLevel.setContainedQuantity(sqliteLevel.getContainedQuantity());
            supabaseLevel.setDimensionsMM(sqliteLevel.getDimensionsMM());
            supabaseLevel.setWeightKg(sqliteLevel.getWeightKg());
            supabaseLevel.setCapacityUnits(sqliteLevel.getCapacityUnits());
            supabaseLevel.setIdTech(sqliteLevel.getIdTech());
            supabaseLevel.setBarcodeType(sqliteLevel.getBarcodeType());
            supabaseLevel.setRfidTagType(sqliteLevel.getRfidTagType());
            supabaseLevel.setEpcFormat(sqliteLevel.getEpcFormat());
            supabaseLevel.setLabelTemplate(sqliteLevel.getLabelTemplate());
            supabaseLevel.setGtinFormat(sqliteLevel.getGtinFormat());
            supabaseLevel.setDefaultLabelCopies(sqliteLevel.getDefaultLabelCopies());
            supabaseLevel.setReturnable(sqliteLevel.getIsReturnable());
            supabaseLevel.setSerialized(sqliteLevel.getIsSerialized());
            
            supabasePackagingLevelRepository.save(supabaseLevel);
        }
    }
}