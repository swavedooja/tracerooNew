package com.ilms.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IlmsBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(IlmsBackendApplication.class, args);
    }
}