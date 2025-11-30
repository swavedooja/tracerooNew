package com.ilms.backend.service;

import com.ilms.backend.dto.MaterialDTO;
import com.ilms.backend.entity.*;
import com.ilms.backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialService {
    private final MaterialMasterRepository materialRepo;
    private final HandlingParameterRepository handlingRepo;
    private final MaterialImageRepository imageRepo;
    private final MaterialDocumentRepository docRepo;

    @Value("${ilms.upload.images}")
    private String imagesDir;
    @Value("${ilms.upload.docs}")
    private String docsDir;

    public MaterialService(MaterialMasterRepository materialRepo,
                           HandlingParameterRepository handlingRepo,
                           MaterialImageRepository imageRepo,
                           MaterialDocumentRepository docRepo) {
        this.materialRepo = materialRepo;
        this.handlingRepo = handlingRepo;
        this.imageRepo = imageRepo;
        this.docRepo = docRepo;
    }

    public Page<MaterialMaster> list(String search, int page, int size) {
        if (search == null || search.isBlank()) {
            return materialRepo.findAll(PageRequest.of(page, size));
        }
        return materialRepo.findByMaterialCodeContainingIgnoreCaseOrMaterialNameContainingIgnoreCase(search, search, PageRequest.of(page, size));
    }

    public Optional<MaterialMaster> getByCode(String code) {
        return materialRepo.findById(code);
    }

    @Transactional
    public MaterialMaster createOrUpdate(MaterialDTO dto) {
        MaterialMaster m = materialRepo.findById(dto.getMaterialCode()).orElseGet(MaterialMaster::new);
        m.setMaterialCode(dto.getMaterialCode());
        m.setMaterialName(dto.getMaterialName());
        m.setDescription(dto.getDescription());
        m.setSku(dto.getSku());
        m.setEanGtIN(dto.getEanGtIN());
        m.setUpc(dto.getUpc());
        m.setCountryOfOrigin(dto.getCountryOfOrigin());
        m.setType(dto.getType());
        m.setMaterialClass(dto.getMaterialClass());
        m.setMaterialGroup(dto.getMaterialGroup());
        m.setGs1CategoryCode(dto.getGs1CategoryCode());
        m.setShelfLifeDays(dto.getShelfLifeDays());
        m.setShelfLifeUom(dto.getShelfLifeUom());
        m.setStorageType(dto.getStorageType());
        m.setProcurementType(dto.getProcurementType());
        m.setBaseUOM(dto.getBaseUOM());
        m.setNetWeightKg(dto.getNetWeightKg());
        m.setDimensionsMM(dto.getDimensionsMM());
        m.setTradeUOM(dto.getTradeUOM());
        m.setTradeWeightKg(dto.getTradeWeightKg());
        m.setTradeDimensionsMM(dto.getTradeDimensionsMM());
        m.setIsPackaged(dto.getIsPackaged());
        m.setIsMilitaryGrade(dto.getIsMilitaryGrade());
        m.setIsFragile(dto.getIsFragile());
        m.setIsEnvSensitive(dto.getIsEnvSensitive());
        m.setIsHighValue(dto.getIsHighValue());
        m.setIsHazardous(dto.getIsHazardous());
        m.setIsBatchManaged(dto.getIsBatchManaged());
        m.setPackagingMaterialCode(dto.getPackagingMaterialCode());
        m.setIsSerialized(dto.getIsSerialized());
        m.setIsRfidCapable(dto.getIsRfidCapable());
        m.setExternalERPCode(dto.getExternalERPCode());
        m.setItemWeight(dto.getItemWeight());
        m.setItemDimension(dto.getItemDimension());
        m.setMaxStoragePeriod(dto.getMaxStoragePeriod());
        m.setMaterialEANupc(dto.getMaterialEANupc());

        if (dto.getHandlingParameter() != null) {
            HandlingParameter hp = m.getHandlingParameter();
            if (hp == null) {
                hp = new HandlingParameter();
                hp.setMaterial(m);
            }
            hp.setTemperatureMin(dto.getHandlingParameter().getTemperatureMin());
            hp.setTemperatureMax(dto.getHandlingParameter().getTemperatureMax());
            hp.setHumidityMin(dto.getHandlingParameter().getHumidityMin());
            hp.setHumidityMax(dto.getHandlingParameter().getHumidityMax());
            hp.setHazardousClass(dto.getHandlingParameter().getHazardousClass());
            hp.setPrecautions(dto.getHandlingParameter().getPrecautions());
            hp.setEnvParameters(dto.getHandlingParameter().getEnvParameters());
            hp.setEpcFormat(dto.getHandlingParameter().getEpcFormat());
            m.setHandlingParameter(hp);
        }
        return materialRepo.save(m);
    }

    public void delete(String code) {
        materialRepo.deleteById(code);
    }

    public List<com.ilms.backend.entity.MaterialImage> listImages(MaterialMaster m) {
        return imageRepo.findByMaterial(m);
    }

    public List<com.ilms.backend.entity.MaterialDocument> listDocs(MaterialMaster m) {
        return docRepo.findByMaterial(m);
    }

    public MaterialImage saveImage(MaterialMaster m, MultipartFile file, String type) throws IOException {
        Path dir = Paths.get(imagesDir);
        Files.createDirectories(dir);
        Path dest = dir.resolve(System.currentTimeMillis() + "_" + file.getOriginalFilename());
        Files.copy(file.getInputStream(), dest);
        MaterialImage img = new MaterialImage();
        img.setMaterial(m);
        img.setType(type);
        img.setFilename(dest.getFileName().toString());
        img.setUrl("/" + imagesDir + "/" + img.getFilename());
        return imageRepo.save(img);
    }

    public MaterialDocument saveDocument(MaterialMaster m, MultipartFile file, String docType) throws IOException {
        Path dir = Paths.get(docsDir);
        Files.createDirectories(dir);
        Path dest = dir.resolve(System.currentTimeMillis() + "_" + file.getOriginalFilename());
        Files.copy(file.getInputStream(), dest);
        MaterialDocument d = new MaterialDocument();
        d.setMaterial(m);
        d.setDocType(docType);
        d.setFilename(dest.getFileName().toString());
        d.setUrl("/" + docsDir + "/" + d.getFilename());
        return docRepo.save(d);
    }
}
