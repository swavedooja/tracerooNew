package com.ilms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "shipping_container")
@Getter
@Setter
public class ShippingContainer extends ContainerUnit {
    private String containerNumber;
    private String sealNumber;
}
