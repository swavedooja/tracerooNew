# Migration Guide: Supabase to Spring Boot + MS SQL

This guide provides a detailed, class-by-class and method-by-method approach to migrating the current Supabase-based backend to a Spring Boot application connecting to an MS SQL Server database.

## 1. Project Setup

### 1.1. Initialize Spring Boot Project
Use Spring Initializr (start.spring.io) with the following dependencies:
- **Spring Web**: For building RESTful APIs.
- **Spring Data JPA**: For database access using Hibernate/JPA.
- **MS SQL Server Driver**: For connecting to the MS SQL database.
- **Lombok**: To reduce boilerplate code (Getters, Setters, etc.).
- **Validation**: For input validation.

### 1.2. Application Configuration (`application.properties`)
Configure the connection to your MS SQL Server instance.

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ILMS;encrypt=true;trustServerCertificate=true;
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServer2012Dialect
```

---

## 2. Entity Mappings (Class by Class)

Map the SQL tables defined in `ilms_migration.sql` to Java Entities.

### 2.1. Master Definitions (`MasterDefinition.java`)
**Table:** `master_definitions`
```java
@Entity
@Table(name = "master_definitions")
@Data
public class MasterDefinition {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "def_type", nullable = false)
    private String defType;

    @Column(name = "def_value", nullable = false)
    private String defValue;

    private String description;
}
```

### 2.2. Location (`Location.java`)
**Table:** `locations`
```java
@Entity
@Table(name = "locations")
@Data
public class Location {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;
    
    private String name;
    private String type;
    private String category;
    
    @Column(name = "parent_id")
    private UUID parentId;
    
    @Column(name = "address_line1")
    private String addressLine1;
    
    private String status;
}
```

### 2.3. Material (`Material.java`)
**Table:** `materials`
```java
@Entity
@Table(name = "materials")
@Data
public class Material {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;
    
    private String name;
    private String description;
    private String type;
    private String category;
    
    @Column(name = "base_uom")
    private String baseUom;
    
    // ... map remaining fields (isBatchManaged, minStock, etc.) matching snake_case columns
}
```

### 2.4. Inventory (`Inventory.java`)
**Table:** `inventory`
```java
@Entity
@Table(name = "inventory")
@Data
public class Inventory {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @Column(name = "serial_number", unique = true)
    private String serialNumber;

    @Column(name = "batch_number")
    private String batchNumber;
    
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
    
    // ... map other fields
}
```

---

## 3. Repository Layer (Interfaces)

Create specific repositories for each entity extending `JpaRepository`.

```java
public interface MaterialRepository extends JpaRepository<Material, UUID> {
    Optional<Material> findByCode(String code);
}

public interface LocationRepository extends JpaRepository<Location, UUID> {
    List<Location> findByParentId(UUID parentId);
    List<Location> findByParentIdIsNull(); // Roots
}

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findBySerialNumber(String serialNumber);
    List<Inventory> findByBatchNumber(String batchNumber);
}
```

---

## 4. Service & Controller Layer (Method by Method Mappings)

This section maps the existing `APIService.js` methods to Spring Boot Controller endpoints.

### 4.1. Materials API (`MaterialsController.java`)

| Frontend Method | URL Path | HTTP Verb | Backend Method Implementation |
| :--- | :--- | :--- | :--- |
| `list()` | `/api/materials` | `GET` | `repository.findAll()` |
| `get(code)` | `/api/materials/{code}` | `GET` | `repository.findByCode(code)` |
| `create(item)` | `/api/materials` | `POST` | `repository.save(entity)` |
| `update(code, item)` | `/api/materials/{code}` | `PUT` | Find by code, update fields, `repository.save()` |
| `remove(code)` | `/api/materials/{code}` | `DELETE` | `repository.deleteByCode(code)` |

### 4.2. Location API (`LocationController.java`)

| Frontend Method | URL Path | HTTP Verb | Backend Method Implementation |
| :--- | :--- | :--- | :--- |
| `list()` | `/api/locations` | `GET` | `repository.findAll()` |
| `getChildren(parentId)` | `/api/locations` | `GET` | Query param `parentId`. If null, `findByParentIdIsNull()`, else `findByParentId(uuid)` |
| `create(item)` | `/api/locations` | `POST` | `repository.save(entity)` |

### 4.3. Inventory API (`InventoryController.java`)

| Frontend Method | URL Path | HTTP Verb | Backend Method Implementation |
| :--- | :--- | :--- | :--- |
| `list(filters)` | `/api/inventory` | `GET` | Use `Specification` or query params to filter by status, materialId, batchNumber. |
| `getBySerial(sn)` | `/api/inventory/serial/{sn}` | `GET` | `repository.findBySerialNumber(sn)` |
| `create(item)` | `/api/inventory` | `POST` | `repository.save(entity)` |
| `confirmScan(...)` | `/api/inventory/scan` | `POST` | **Complex Logic**: Find item, update status to 'ACTIVE', set `scanLocationId`, update confirmedAt/By. Return updated item. |

### 4.4. Serial Pool API (RPC Calls -> Service Logic)

**Frontend:** `SerialPoolAPI.reserveSerials` (calls database function)
**Backend:** `SerialPoolService.reserveSerials` method.
```java
@Transactional
public void reserveSerials(UUID materialId, String batchNumber, int quantity, String createdBy) {
    for (int i = 0; i < quantity; i++) {
        SerialNumberPool pool = new SerialNumberPool();
        pool.setMaterialId(materialId);
        pool.setBatchNumber(batchNumber);
        pool.setSerialNumber(UUID.randomUUID().toString()); // Or custom logic
        pool.setStatus("RESERVED");
        repository.save(pool);
    }
}
```

### 4.5. Aggregation API (RPC Calls -> Service Logic)

**Frontend:** `AggregationAPI.pack(parentId, childType, childIds)` (calls `pack_items` RPC)
**Backend:** `AggregationService.pack`
```java
@Transactional
public void packItems(UUID parentId, String childType, List<UUID> childIds) {
    // 1. Validate parent container exists
    // 2. Loop through childIds
    // 3. Create Aggregation entity for each
    // 4. Update child status if necessary (e.g., Inventory status)
}
```

### 4.6. Trace API (Polymorphic Queries)

**Frontend:** `TraceAPI.searchBySerial(serial)`
**Backend:** `TraceService.search`
1. Check `InventoryRepository.findBySerialNumber`.
2. If found, return DTO with type `INVENTORY`.
3. Else, check `ContainerRepository.findBySerialNumber`.
4. If found, return DTO with type `CONTAINER`.
5. Return 404 if neither found.

---

## 5. Security & Authentication

Since Supabase handles authentication currently, you will need to implement an equivalent in Spring Boot.
- **Recommended**: Spring Security with JWT.
- **Migration**:
    1. Create a `Users` table in MS SQL.
    2. Create a `/auth/login` endpoint to issue JWTs.
    3. Secure all `/api/**` endpoints requiring the JWT in the header.

## 6. Summary of Steps

1.  **Run SQL Script**: Execute `ilms_migration.sql` on your MS SQL Server.
2.  **Generate Spring Project**: Create the skeleton with `web`, `jpa`, `sqlserver` dependencies.
3.  **Configure DB**: Update `application.properties` with credentials.
4.  **Create Entities**: Copy the Java class definitions provided above.
5.  **Create Repositories**: Define the interfaces.
6.  **Implement Controllers**: Create the REST endpoints mapping to the frontend calls.
7.  **Update Frontend**: Change `supabaseClient.js` to an `axios` or `fetch` based client pointing to `http://localhost:8080/api`.
