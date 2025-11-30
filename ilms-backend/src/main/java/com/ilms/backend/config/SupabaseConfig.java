package com.ilms.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.ilms.backend.supabase.repository",
    entityManagerFactoryRef = "supabaseEntityManagerFactory",
    transactionManagerRef = "supabaseTransactionManager"
)
public class SupabaseConfig {

    @Value("${supabase.db.url:jdbc:postgresql://localhost:5432/postgres}")
    private String supabaseDbUrl;

    @Value("${supabase.db.username:postgres}")
    private String supabaseDbUsername;

    @Value("${supabase.db.password:postgres}")
    private String supabaseDbPassword;

    @Bean
    public DataSource supabaseDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(supabaseDbUrl);
        dataSource.setUsername(supabaseDbUsername);
        dataSource.setPassword(supabaseDbPassword);
        dataSource.setDriverClassName("org.postgresql.Driver");
        return dataSource;
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean supabaseEntityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(supabaseDataSource());
        em.setPackagesToScan("com.ilms.backend.supabase.entity");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);

        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.put("hibernate.show_sql", "true");
        em.setJpaPropertyMap(properties);

        return em;
    }

    @Bean
    public PlatformTransactionManager supabaseTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(supabaseEntityManagerFactory().getObject());
        return transactionManager;
    }
}