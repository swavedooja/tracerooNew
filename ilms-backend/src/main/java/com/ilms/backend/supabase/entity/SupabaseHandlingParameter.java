package com.ilms.backend.supabase.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "handling_parameter")
@Getter
@Setter
public class SupabaseHandlingParameter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_code", unique = true)
    private String materialCode;

    @Column(name = "temperature_min")
    private Double temperatureMin;

    @Column(name = "temperature_max")
    private Double temperatureMax;

    @Column(name = "humidity_min")
    private Double humidityMin;

    @Column(name = "humidity_max")
    private Double humidityMax;

    @Column(name = "hazardous_class")
    private String hazardousClass;

    private String precautions;
    @Column(name = "env_parameters")
    private String envParameters;
    @Column(name = "epc_format")
    private String epcFormat;
}