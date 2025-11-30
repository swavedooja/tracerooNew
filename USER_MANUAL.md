# TraceRoo ILMS - User Manual

Welcome to the TraceRoo Integrated Logistics Management System (ILMS). This manual guides you through the features and functionalities implemented in the system.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Master Data Management](#master-data-management)
    - [Materials](#materials)
    - [Packaging Hierarchy](#packaging-hierarchy)
4. [Warehouse Management](#warehouse-management)
5. [Label Designer](#label-designer)
6. [Inventory Operations](#inventory-operations)
    - [Registration](#registration)
    - [Packing Station](#packing-station)
7. [Track & Trace](#track--trace)

---

## Getting Started

### Accessing the Application
Open your web browser and navigate to `http://localhost:3000` (or your deployed URL).
You will be greeted with the Login screen.

**Default Credentials:**
- **Username:** `admin`
- **Password:** `admin`

---

## Dashboard
Upon logging in, you will see the main **Dashboard**. This provides an overview of the system status (Metrics to be added).
Use the **Navigation Bar** on the left (drawer) or top to access different modules.

---

## Master Data Management

### Materials
Manage your product catalog and material definitions.

**Access:** Click on **Materials** in the navigation menu.

**Features:**
- **List View:** See all registered materials.
- **Create New Material:** Click the "+" button to add a new material.
    - **General Info:** Code, Name, Description, Type.
    - **Attributes:** Shelf Life (Days/UOM), Storage Conditions.
    - **Compliance Flags:** Military Grade, Hazardous, RFID Capable.
- **Edit Material:** Click on a material card to edit its details.

### Packaging Hierarchy
Define how materials are packed (e.g., Item -> Box -> Pallet).

**Access:** Click on **Packaging** in the navigation menu.

**Features:**
- **Visual Editor:** View and modify the parent-child relationships between packaging levels.

---

## Warehouse Management
Manage your physical storage locations.

**Access:** Click on **Warehouses** in the navigation menu.

**Features:**
- **Warehouse List:** View all distribution centers and warehouses.
- **Add Warehouse:** Click "New Warehouse".
    - Enter Code, Name, Location, and Type.
- **Storage Locations:** Inside a warehouse detail view, you can manage specific locations (Racks, Bins).
    - **Add Location:** Define a code (e.g., `A-01-01`), Type (Rack/Bin), and Description.

---

## Label Designer
Create custom label templates for your items and packages.

**Access:** Click on **Label Designer** in the navigation menu.

**Features:**
- **Template List:** View existing label templates.
- **Designer Canvas:** Click "New Template" to open the drag-and-drop editor.
    - **Properties:** Set Label Name, Target Level (Item/Box/Pallet), and Dimensions (mm).
    - **Tools:**
        - **Text:** Add static text fields.
        - **Barcode:** Add a placeholder barcode.
        - **QR Code:** Add a placeholder QR code.
    - **Actions:** Drag elements to position them. Click an element to edit its properties (content, font size) or delete it.
    - **Save:** Persist your template for future use.

---

## Inventory Operations

### Registration
Register new batches of raw materials or finished goods into the system.

**Access:** Click on **Registration** in the navigation menu.

**Features:**
- **Material Selection:** Choose a material from the dropdown.
- **Batch Details:** Enter the Manufacturer Batch Number.
- **Quantity:** Specify how many individual units to generate.
- **Action:** Click "Register Batch" to generate unique Serial Numbers for each item.

### Packing Station
Pack individual items into boxes or containers.

**Access:** Click on **Packing Station** in the navigation menu.

**Features:**
- **Scan Item:** Enter or scan the Serial Number of an item.
    - The system validates if the item exists and is available.
    - Scanned items appear in the "Scanned Items" list.
- **Box Details:** Enter the Serial Number for the new Box/Container.
- **Pack:** Click "Pack Box" to associate all scanned items with the parent box. This updates their status to `PACKED`.

---

## Track & Trace
Trace the history and lineage of any item or container.

**Access:** Click on **Track & Trace** in the navigation menu.

**Features:**
- **Search Portal:** Enter a Serial Number (Item, Box, or Pallet).
- **Timeline View:** Visualizes the lifecycle events of the item.
    - **Events:** Registration, Packing, Shipping, etc.
    - **Details:** Timestamp, Location, User, and Notes for each event.

---

## Support
For technical support, please contact the IT department or refer to the technical documentation in the `README.md` file.
