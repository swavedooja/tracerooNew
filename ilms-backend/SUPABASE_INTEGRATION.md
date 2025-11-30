# Supabase Integration for ILMS Backend

This document describes the Supabase integration added to the ILMS backend to enable periodic synchronization between the local SQLite database and a Supabase PostgreSQL database.

## Architecture Overview

The integration maintains the existing SQLite database as the primary data store while adding Supabase as a secondary data store for backup, analytics, or other purposes. Data is synchronized periodically from SQLite to Supabase.

## Components

### 1. Supabase Configuration
- `SupabaseConfig.java` - Configuration class for Supabase database connectivity
- PostgreSQL driver dependency added to `pom.xml`
- Supabase connection properties in `application.properties`

### 2. Supabase Entities
Mirror entities of the existing SQLite entities:
- `SupabaseMaterialMaster.java`
- `SupabaseHandlingParameter.java`
- `SupabaseMaterialImage.java`
- `SupabaseMaterialDocument.java`
- `SupabasePackagingHierarchy.java`
- `SupabasePackagingLevel.java`

### 3. Supabase Repositories
JPA repositories for each Supabase entity:
- `SupabaseMaterialMasterRepository.java`
- `SupabaseHandlingParameterRepository.java`
- `SupabaseMaterialImageRepository.java`
- `SupabaseMaterialDocumentRepository.java`
- `SupabasePackagingHierarchyRepository.java`
- `SupabasePackagingLevelRepository.java`

### 4. Synchronization Service
- `SupabaseSyncService.java` - Service class that handles periodic synchronization
- Scheduled to run every 5 minutes using `@Scheduled` annotation
- Synchronizes all entities from SQLite to Supabase

## Configuration

### Environment Variables
The following environment variables can be set to configure Supabase connectivity:
- `SUPABASE_DB_URL` - Supabase database URL (default: jdbc:postgresql://localhost:5432/postgres)
- `SUPABASE_DB_USERNAME` - Supabase database username (default: postgres)
- `SUPABASE_DB_PASSWORD` - Supabase database password (default: postgres)

### Application Properties
Additional properties in `application.properties`:
```properties
# Supabase Configuration
supabase.db.url=${SUPABASE_DB_URL:jdbc:postgresql://localhost:5432/postgres}
supabase.db.username=${SUPABASE_DB_USERNAME:postgres}
supabase.db.password=${SUPABASE_DB_PASSWORD:postgres}
supabase.sync.enabled=true
supabase.sync.interval=300000
```

## Synchronization Process

The synchronization process runs every 5 minutes and performs the following steps:
1. Fetch all records from each SQLite repository
2. For each record, check if it exists in the corresponding Supabase repository
3. If it exists, update the existing record; if not, create a new record
4. Copy all fields from the SQLite entity to the Supabase entity

## Usage

To enable the synchronization:
1. Ensure the Supabase database is accessible
2. Set the appropriate environment variables or use default values
3. Start the application - synchronization will begin automatically

To manually trigger synchronization:
- The `syncDataToSupabase()` method in `SupabaseSyncService` can be called directly

## Future Enhancements

Possible future enhancements:
1. Add bidirectional synchronization
2. Add conflict resolution mechanisms
3. Add selective synchronization based on entity types
4. Add synchronization status monitoring and reporting
5. Add error handling and retry mechanisms for failed synchronizations