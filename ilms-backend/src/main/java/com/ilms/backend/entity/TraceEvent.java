package com.ilms.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "trace_event")
@Getter
@Setter
public class TraceEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false)
    private String eventType; // PRODUCTION, PACKING, SHIPPING, RECEIVING, EXCEPTION

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    private String location; // Warehouse name or GPS coordinates
    private String user; // Username or ID

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String status; // SUCCESS, FAILED

    // Links to entities involved in the event
    @ManyToOne
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @ManyToOne
    @JoinColumn(name = "container_id")
    private ContainerUnit container;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
