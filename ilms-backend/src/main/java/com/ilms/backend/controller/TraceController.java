package com.ilms.backend.controller;

import com.ilms.backend.entity.TraceEvent;
import com.ilms.backend.service.TraceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trace")
@CrossOrigin(origins = "*")
public class TraceController {
    private final TraceService service;

    public TraceController(TraceService service) {
        this.service = service;
    }

    @GetMapping("/{serialNumber}")
    public List<TraceEvent> getHistory(@PathVariable String serialNumber) {
        return service.getHistory(serialNumber);
    }
}
