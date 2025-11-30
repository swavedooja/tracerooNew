package com.ilms.backend.controller;

import com.ilms.backend.entity.LabelTemplate;
import com.ilms.backend.repository.LabelTemplateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/label-templates")
@CrossOrigin(origins = "*")
public class LabelTemplateController {
    private final LabelTemplateRepository repo;

    public LabelTemplateController(LabelTemplateRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<LabelTemplate> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabelTemplate> get(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LabelTemplate create(@RequestBody LabelTemplate template) {
        return repo.save(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabelTemplate> update(@PathVariable Long id, @RequestBody LabelTemplate template) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        template.setId(id);
        return ResponseEntity.ok(repo.save(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
