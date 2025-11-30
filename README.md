# ILMS Material Master & Packaging Hierarchy

This is a full-stack production starter consisting of:

- Backend: Spring Boot 3, Spring Web, Spring Data JPA, Validation, SQLite
- Frontend: React (CRA), React Router, MUI v5, Axios
- File storage: Local filesystem under `./uploads`

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+

## Run Backend

```
cd ilms-backend
mvn clean package
mvn spring-boot:run
```

The API will be at http://localhost:8080.

SQLite DB file `ilms.db` will be created in the backend folder. Schema and seed data are applied via `schema.sql` and `data.sql` on first run.

Static files uploaded will be served from `http://localhost:8080/uploads/...`.

## Run Frontend

```
cd ilms-frontend
npm install
npm start
```

The app will start at http://localhost:3000 and is CORS-enabled against the backend.

## Sample cURL

Upload a material image (replace file path):

```
curl -F "file=@./sample.jpg" -F "type=material" http://localhost:8080/api/materials/MAT-2024-0001/images
```

Create packaging hierarchy:

```
curl -X POST http://localhost:8080/api/packaging-hierarchy \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Standard Shampoo 100ml",
    "gtinAssignmentFormat":"GTIN-14",
    "packagingCapacityConstraints":false,
    "levels":[
      {"levelIndex":1,"levelCode":"L1","levelName":"ITEM","containedQuantity":1,"idTech":"BARCODE","barcodeType":"EAN-13"},
      {"levelIndex":2,"levelCode":"L2","levelName":"CARTON","containedQuantity":12,"idTech":"BARCODE","barcodeType":"EAN-128"},
      {"levelIndex":3,"levelCode":"L3","levelName":"BOX","containedQuantity":4,"idTech":"BARCODE","barcodeType":"EAN-128"},
      {"levelIndex":4,"levelCode":"L4","levelName":"PALLET","containedQuantity":50,"idTech":"RFID","rfidTagType":"UHF"},
      {"levelIndex":5,"levelCode":"L5","levelName":"CONTAINER","containedQuantity":20,"idTech":"RFID","rfidTagType":"UHF"}
    ]
  }'
```

Preview totals (example response below):

```
curl http://localhost:8080/api/packaging-hierarchy/1/preview
```

Sample response:

```json
{
  "hierarchyId": 1,
  "name": "Standard Shampoo 100ml",
  "levels": [
    {"levelIndex":1,"levelName":"ITEM","containedQuantity":1,"totalBaseItems":1,"idTech":"BARCODE"},
    {"levelIndex":2,"levelName":"CARTON","containedQuantity":12,"totalBaseItems":12,"idTech":"BARCODE"},
    {"levelIndex":3,"levelName":"BOX","containedQuantity":4,"totalBaseItems":48,"idTech":"BARCODE"},
    {"levelIndex":4,"levelName":"PALLET","containedQuantity":50,"totalBaseItems":2400,"idTech":"RFID"},
    {"levelIndex":5,"levelName":"CONTAINER","containedQuantity":20,"totalBaseItems":48000,"idTech":"RFID"}
  ],
  "summary": [
    "1 CONTAINER - 20 PALLET = 48000 ITEMS",
    "1 PALLET - 50 BOX = 2400 ITEMS",
    "1 BOX - 4 CARTON = 48 ITEMS",
    "1 CARTON - 12 ITEM = 12 ITEMS"
  ]
}
```

## UI Overview

- Material Master screen matches the provided layout: left image card with dotted border and gallery; right details table inside a Paper; tabs: Material Details | Bill Of Material | Storage Location | Supplier Details.
- Packaging Hierarchy screen shows nested box-in-box visualization with Save Hierarchy | Preview | Cancel controls.

## Extending

- Add fields to `MaterialMaster` and `HandlingParameter` entities and mirror in DTOs and frontend forms.
- Add more validation using `jakarta.validation` annotations.


## BBP

# TraceRoo: Asset Track & Trace Solution  
## Business Blueprint Document – Complete Edition  
**Version 2.0 | November 2025**  

---

## 1. Executive Summary

- Purpose of TraceRoo
- Web (Label Designer) + Mobile (Scanning & Lifecycle) overview
- Supported technologies: Barcode, RFID, QR, BLE
- Key business benefits and KPIs

---

## 2. Master Data Creation

### 2.1 Product / Material Definition

- Core identification: code, name, description, EAN, UPC, GTIN, SKU, country of origin  
- Classification:
  - Material type (Raw Material, Finished Goods, Scrap, etc.)
  - Physical state (Solid, Liquid, Dust, Gas, Gel)
  - Category, class, group  
- Physical & dimensional attributes:
  - UOM, weight, dimensions, volume
  - Shelf life (value + UOM)
- Storage & environmental requirements:
  - Storage type, temperature band, humidity band
  - Pre‑requisite environmental parameters
- Regulatory / special flags (Yes/No):
  - Packaged Material, Military Grade, Fragile, High Value, Environment Sensitive, Hazardous, Batch Material, Serialized, RFID capable, Multi‑level packaging

### 2.2 Packaging Hierarchy Definition

- Levels: Item → Box/Carton → Pallet → Container/Truck  
- For each level:
  - Dimensions, capacity, empty/full weight
  - ID format (e.g., `SN-YYYY-XXXXXX`, `BOX-YYYY-XXXXXX`)
  - Identification technology (Barcode / RFID / QR / BLE)
  - Label size and copies per unit (e.g., 2 copies per sachet)
  - Inherited attributes (GTIN, batch, expiry, sensitivity)

### 2.3 Hierarchy Attributes per Level

- Mandatory attributes:
  - GTIN, expiry date, batch, manufacturing date, capacity, net/gross weight
- Conditional attributes:
  - Temperature / humidity sensitivity, fragility, hazard class, special handling codes
- Tracking attributes:
  - Serial number, QC status, owner, location, timestamps

---

## 3. Label & Barcode / RFID Design

### 3.1 Label Template Design (Web)

- Separate templates per hierarchy level: Item, Box, Pallet, Container  
- Canvas features:
  - Drag‑and‑drop text, barcodes, QR, images, shapes
  - Dynamic placeholders: `{{SKU}}`, `{{BATCH_ID}}`, `{{EXPIRY_DATE}}`, `{{SERIAL}}`, `{{BOX_ID}}`, `{{PALLET_ID}}`, `{{CONTAINER_ID}}`, etc.
- Versioning & approval:
  - Draft → Review → Approved → Active → Retired

### 3.2 Hierarchy Mapping in Designer

- Product‑level hierarchy configuration:
  - Define levels, capacities, label templates, ID formats
- Context‑aware template design:
  - Available fields based on level (child/parent/grandparent)
- Relationship rules:
  - Item → Box (capacity, auto‑close, auto‑print)
  - Box → Pallet (boxes per pallet)
  - Pallet → Container (pallets per container)

### 3.3 Label Generation

- Parameters:
  - Quantity, copies per unit, paper size (A4, etc.), labels per page
- Output options:
  - Direct print to thermal printer
  - PDF generation (single or split)
  - Re‑print logic (job ID, serial range, reason)

### 3.4 RFID Tag Generation (Non‑Label Data Carrier)

- Tag schemes by level:
  - Item: EPC = GTIN + Serial
  - Box: Box ID + batch + item count
  - Pallet: Pallet ID + destination
  - Container: Container ID + contents summary
- Tag commissioning:
  - Batch encoding, read‑rate verification, mapping tag ↔ serial, deployment

---

## 4. Material Inventory Creation – Barcode

### 4.1 Serialization & Raw Inventory Registration

- Batch creation: batch ID, mfg date, expiry, quantity
- Serial number generation per item
- Raw inventory registration into warehouse/bin

### 4.2 Labelling

- Batch label generation
- Printing and physical application
- Sample QC of labels (scanability)

### 4.3 Scanning & Inventory Entry

- Mobile scanning session
- Validation of serial format and duplicates
- Variance handling (missing/damaged items)
- Status updates: REGISTERED → SCANNED

---

## 5. Material Inventory Creation – RFID

### 5.1 RFID Serialization

- Tag ID ranges and EPC format
- Mapping to item serials

### 5.2 Tag Commissioning

- Batch encoding
- Read‑rate and range validation
- Linking to inventory records

### 5.3 RFID Detection & Capture

- Bulk reads using handheld/fixed readers
- Performance vs barcode:
  - Time, accuracy, labor effort
- Status updates: RFID_COMMISSIONED → RFID_SCANNED

---

## 6. Packaging Inventory Creation – Barcode

### 6.1 Packaging Item Serialization

- Packaging material (cartons, boxes) registration
- Serial ranges for packaging units

### 6.2 Packaging Labelling

- Packaging label template
- Printing & application

### 6.3 Packaging Scanning

- Inventory session for packaging stock
- Status: RECEIVED_RAW_PACKAGING → PACKAGING_INVENTORY_CAPTURED

---

## 7. Packaging Inventory Creation – RFID

- RFID‑enabled cartons/pallets
- Tag encoding, verification, scanning
- When to use RFID vs barcode for packaging

---

## 8. Capture Events

### 8.1 Track & Trace Events

- Event types:
  - Production, Inventory, Packing, Shipping, Receiving, Exception
- Event record structure:
  - Type, item/box/pallet/container IDs, timestamp, user, warehouse/location, GPS (optional), status, notes, photo, barcode/RFID scanned, digital signature

### 8.2 Ownership Events

- Ownership chain:
  - Manufacturer → Warehouse → Logistics → Customer
- Stored fields:
  - Owner type, owner entity, effective from/to, location

### 8.3 Packing Lists & Manifests

- Packing list structure:
  - Shipment/container, pallets, boxes, items, weights, volumes, serial ranges
- Actions:
  - Print, email to receiver, attach to shipment

---

## 9. Dashboards & Analytics

### 9.1 Material Track & Trace Dashboard

- Search by serial, batch, barcode
- Current status and location
- Event timeline
- Genealogy (Item ↔ Box ↔ Pallet ↔ Container)

### 9.2 Overview Dashboard

- Key metrics:
  - Total items, in production, in inventory, in transit, delivered
- Inventory distribution by warehouse/location
- Quality KPIs:
  - QC pass/reject, scrap, returns
- Alerts (expiries, low stock, delays)

### 9.3 Real‑Time Product Lifecycle

- Stage‑wise view:
  - Production → Inventory → Packing → Shipping → Delivery
- Drill‑down:
  - Per batch, per shipment, per warehouse

---

## 10. Data Model (PostgreSQL)

### 10.1 Main Entities

- products  
- packaging_hierarchy  
- label_templates  
- inventory  
- boxes  
- pallets  
- containers (shipments)  
- events  
- warehouses  
- storage_locations  
- users  

### 10.2 Key Tables (DDL – high level)

- `products`  
  - Identification, classification, physical & regulatory attributes  
- `packaging_hierarchy`  
  - Product, level, dimensions, capacity, ID format, identification technology, parent level  
- `label_templates`  
  - Product, level, template metadata, size, layout JSON, barcode/QR config, status  
- `inventory`  
  - Product, serial, batch, barcode, RFID, warehouse, location, status, QC, parent box/pallet/container  
- `boxes`, `pallets`, `containers`  
  - Serial/ID, barcode/RFID, capacity, counts, statuses, warehouse/destination  
- `events`  
  - Type, item/box/pallet/container, timestamps, locations, user, status, notes, scan values, photos, signature  
- `warehouses`, `storage_locations`, `users`  
  - Master data and security context  

### 10.3 ER Diagram (Logical Description)

- One **product** has many **packaging_hierarchy** rows  
- One **product** has many **label_templates**  
- One **product** has many **inventory** items  
- **Inventory** optionally belongs to a **box**, which belongs to a **pallet**, which belongs to a **container**  
- **Events** reference **inventory** (and optionally box/pallet/container), **warehouse**, and **user**  
- **Warehouses** have many **storage_locations** and **users**  

---

## 11. Security, Compliance & Audit

- RBAC: Admin, Designer, Operator, QC Inspector, Viewer  
- Data protection: encryption in transit/at rest  
- Immutable audit logs for events and configuration changes  
- GS1, FDA 21 CFR Part 11 (if applicable), and retention policies  

---

## 12. Implementation Roadmap

- Phase 1: Core (master data, label design, barcode packing & tracking)  
- Phase 2: RFID, QC workflows, RSR, dashboards  
- Phase 3: Integrations (ERP/WMS/3PL), predictive analytics, supplier portal  

---

**TraceRoo Business Blueprint – Markdown Source (High-Level)**  
Version 2.0
