package com.ilms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pallet")
@Getter
@Setter
public class Pallet extends ContainerUnit {
    private Integer boxCount;
}
