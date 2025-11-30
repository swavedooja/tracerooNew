package com.ilms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "box")
@Getter
@Setter
public class Box extends ContainerUnit {
    private String batchNumber;
    private Integer itemCount;
}
