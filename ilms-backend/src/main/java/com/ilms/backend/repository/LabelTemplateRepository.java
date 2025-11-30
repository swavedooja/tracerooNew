package com.ilms.backend.repository;

import com.ilms.backend.entity.LabelTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabelTemplateRepository extends JpaRepository<LabelTemplate, Long> {
    List<LabelTemplate> findByLevelName(String levelName);
}
