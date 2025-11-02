# Geolocation & Privacy-Preserving Location

> **Version:** 1.0  
> **Last Updated:** November 2, 2025  
> **Technology:** PostGIS + Google Maps API

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [PostGIS Setup](#postgis-setup)
4. [Privacy Logic](#privacy-logic)
5. [Radius Search](#radius-search)
6. [Google Maps Integration](#google-maps-integration)
7. [Geocoding](#geocoding)
8. [Distance Calculation](#distance-calculation)
9. [Performance](#performance)

---

## Overview

### Privacy-First Approach (PIPEDA Compliance)

**Key Principles:**
- ✅ Store exact location in database (for search)
- ✅ Show **fuzzy location** publicly (±500m radius)
- ✅ Reveal **exact address** only after order acceptance
- ✅ Users can hide location completely (online services only)

**Use Cases:**
1. **Client** searching for nearby contractors
2. **Contractor** searching for nearby orders
3. **Privacy** - protecting user's exact address

---

## Database Schema

### PostGIS Extension

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

### User Location Schema

```prisma
model User {
  id        String   @id @default(cuid())
  
  // Address (human-readable)
  address   String?
  city      String?
  province  String?
  postalCode String? @map("postal_code")
  country   String   @default("Canada")
  
  // Exact coordinates (for search)
  latitude  Float?
  longitude Float?
  
  // PostGIS geometry point (indexed for fast searches)
  location  Unsupported("geometry(Point, 4326)")?
  
  // Privacy settings
  showLocationOnMap Boolean @default(true) @map("show_location_on_map")
  locationAccuracy  LocationAccuracy @default(FUZZY) @map("location_accuracy")
  
  @@index([location], type: Gist) // PostGIS spatial index
  @@map("users")
}

enum LocationAccuracy {
  EXACT       // Show exact location (only after order acceptance)
  FUZZY       // Show ±500m fuzzy location (public)
  CITY_ONLY   // Show only city
  HIDDEN      // Don't show location (online services only)
}
```

### Order Location Schema

```prisma
model Order {
  id          String @id @default(cuid())
  
  // Work location
  workAddress String?
  workCity    String?
  workProvince String?
  workPostalCode String? @map("work_postal_code")
  
  workLatitude  Float?
  workLongitude Float?
  workLocation  Unsupported("geometry(Point, 4326)")? @map("work_location")
  
  // Location type
  locationType LocationType @default(ON_SITE) @map("location_type")
  
  @@index([workLocation], type: Gist)
  @@map("orders")
}

enum LocationType {
  ON_SITE   // Work at client's location
  REMOTE    // Online/remote work
  FLEXIBLE  // Can be either
}
```

---

## PostGIS Setup

### Create PostGIS Functions

```sql
-- Function to create point from lat/lng
CREATE OR REPLACE FUNCTION create_point(lat FLOAT, lng FLOAT)
RETURNS geometry AS $$
BEGIN
  RETURN ST_SetSRID(ST_MakePoint(lng, lat), 4326);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate distance in kilometers
CREATE OR REPLACE FUNCTION distance_km(point1 geometry, point2 geometry)
RETURNS FLOAT AS $$
BEGIN
  RETURN ST_Distance(point1::geography, point2::geography) / 1000;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Update Location on Lat/Lng Change

```sql
-- Trigger to automatically update PostGIS point when lat/lng changes
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  ELSE
    NEW.location = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_location_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_location_point();

CREATE TRIGGER order_location_trigger
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_location_point();
```

---

## Privacy Logic

### Fuzzy Location Generation

**Add random offset (±500m) to coordinates:**

```typescript
@Injectable()
export class LocationPrivacyService {
  /**
   * Generate fuzzy coordinates (±500m from exact location)
   */
  generateFuzzyCoordinates(lat: number, lng: number): { lat: number; lng: number } {
    // 1 degree latitude ≈ 111 km
    // 1 degree longitude ≈ 111 km * cos(latitude)
    
    const latOffset = (Math.random() - 0.5) * 0.009; // ±500m in degrees
    const lngOffset = (Math.random() - 0.5) * 0.009 / Math.cos(lat * Math.PI / 180);
    
    return {
      lat: lat + latOffset,
      lng: lng + lngOffset,
    };
  }

  /**
   * Get user location based on privacy settings
   */
  async getUserLocation(userId: string, viewerId: string): Promise<LocationDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    // User can see their own exact location
    if (userId === viewerId) {
      return {
        lat: user.latitude,
        lng: user.longitude,
        accuracy: 'exact',
        address: user.address,
      };
    }
    
    // Check if location should be shared
    if (!user.showLocationOnMap) {
      return {
        city: user.city,
        province: user.province,
        accuracy: 'city_only',
      };
    }
    
    // Check if viewer has accepted order with this user
    const hasAcceptedOrder = await this.hasAcceptedOrder(userId, viewerId);
    
    if (hasAcceptedOrder) {
      // Show exact location after order acceptance
      return {
        lat: user.latitude,
        lng: user.longitude,
        accuracy: 'exact',
        address: user.address,
      };
    }
    
    // Show fuzzy location for public
    const fuzzy = this.generateFuzzyCoordinates(user.latitude, user.longitude);
    
    return {
      lat: fuzzy.lat,
      lng: fuzzy.lng,
      accuracy: 'fuzzy',
      city: user.city,
    };
  }

  /**
   * Check if two users have an accepted order together
   */
  private async hasAcceptedOrder(userId1: string, userId2: string): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { clientId: userId1, contractorId: userId2 },
          { clientId: userId2, contractorId: userId1 },
        ],
        status: { in: ['IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'] },
      },
    });
    
    return !!order;
  }
}
```

---

## Radius Search

### Find Users Within Radius

```typescript
@Injectable()
export class GeolocationService {
  /**
   * Find users within radius (PostGIS query)
   */
  async findUsersWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    filters?: {
      role?: UserRole;
      categories?: string[];
      minRating?: number;
    },
  ): Promise<User[]> {
    // Build WHERE clause
    const whereConditions = [];
    const params = [centerLng, centerLat, radiusKm * 1000]; // Convert km to meters
    
    // Base spatial query
    let sql = `
      SELECT 
        u.*,
        ST_Distance(
          u.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) / 1000 AS distance_km
      FROM users u
      WHERE 
        u.location IS NOT NULL
        AND ST_DWithin(
          u.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
    `;
    
    // Add filters
    if (filters?.role) {
      whereConditions.push(`u.roles @> ARRAY['${filters.role}']::user_role[]`);
    }
    
    if (filters?.categories?.length) {
      whereConditions.push(`u.categories && ARRAY[${filters.categories.map(c => `'${c}'`).join(',')}]`);
    }
    
    if (filters?.minRating) {
      whereConditions.push(`u.average_rating >= ${filters.minRating}`);
    }
    
    if (whereConditions.length > 0) {
      sql += ` AND ${whereConditions.join(' AND ')}`;
    }
    
    sql += ` ORDER BY distance_km ASC LIMIT 50`;
    
    // Execute raw query
    const users = await this.prisma.$queryRawUnsafe<User[]>(sql, ...params);
    
    return users;
  }

  /**
   * Find orders within radius
   */
  async findOrdersWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    filters?: {
      categories?: string[];
      minBudget?: number;
      maxBudget?: number;
    },
  ): Promise<Order[]> {
    const params = [centerLng, centerLat, radiusKm * 1000];
    
    let sql = `
      SELECT 
        o.*,
        ST_Distance(
          o.work_location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) / 1000 AS distance_km
      FROM orders o
      WHERE 
        o.work_location IS NOT NULL
        AND o.status = 'PUBLISHED'
        AND ST_DWithin(
          o.work_location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
    `;
    
    const whereConditions = [];
    
    if (filters?.categories?.length) {
      whereConditions.push(`o.category_id = ANY(ARRAY[${filters.categories.map(c => `'${c}'`).join(',')}])`);
    }
    
    if (filters?.minBudget) {
      whereConditions.push(`o.budget >= ${filters.minBudget}`);
    }
    
    if (filters?.maxBudget) {
      whereConditions.push(`o.budget <= ${filters.maxBudget}`);
    }
    
    if (whereConditions.length > 0) {
      sql += ` AND ${whereConditions.join(' AND ')}`;
    }
    
    sql += ` ORDER BY distance_km ASC LIMIT 50`;
    
    return this.prisma.$queryRawUnsafe<Order[]>(sql, ...params);
  }
}
```

---

## Google Maps Integration

### Geocoding Service

```typescript
import { Client } from '@googlemaps/google-maps-services-js';

@Injectable()
export class GeocodingService {
  private mapsClient: Client;

  constructor() {
    this.mapsClient = new Client({});
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
    components: any;
  }> {
    try {
      const response = await this.mapsClient.geocode({
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
          components: { country: 'CA' }, // Restrict to Canada
        },
      });

      if (response.data.results.length === 0) {
        throw new NotFoundException('Address not found');
      }

      const result = response.data.results[0];
      const location = result.geometry.location;

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        components: result.address_components,
      };
    } catch (error) {
      this.logger.error('Geocoding failed:', error);
      throw new BadRequestException('Failed to geocode address');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<{
    formattedAddress: string;
    city: string;
    province: string;
    postalCode: string;
  }> {
    try {
      const response = await this.mapsClient.reverseGeocode({
        params: {
          latlng: { lat, lng },
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      });

      if (response.data.results.length === 0) {
        throw new NotFoundException('Location not found');
      }

      const result = response.data.results[0];
      const components = result.address_components;

      // Extract city, province, postal code
      const city = components.find(c => c.types.includes('locality'))?.long_name;
      const province = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
      const postalCode = components.find(c => c.types.includes('postal_code'))?.long_name;

      return {
        formattedAddress: result.formatted_address,
        city,
        province,
        postalCode,
      };
    } catch (error) {
      this.logger.error('Reverse geocoding failed:', error);
      throw new BadRequestException('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Validate address
   */
  async validateAddress(address: string): Promise<boolean> {
    try {
      const result = await this.geocodeAddress(address);
      return !!result;
    } catch {
      return false;
    }
  }
}
```

---

## Distance Calculation

### Calculate Distance Between Two Points

```typescript
@Injectable()
export class DistanceService {
  /**
   * Calculate distance in km using PostGIS
   */
  async calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): Promise<number> {
    const result = await this.prisma.$queryRaw<{ distance: number }[]>`
      SELECT 
        ST_Distance(
          ST_SetSRID(ST_MakePoint(${lng1}, ${lat1}), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng2}, ${lat2}), 4326)::geography
        ) / 1000 AS distance
    `;

    return result[0].distance;
  }

  /**
   * Haversine formula (fallback if PostGIS unavailable)
   */
  haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

---

## Performance

### Indexes

**Spatial Index (PostGIS):**

```sql
-- Create spatial index on users.location
CREATE INDEX idx_users_location ON users USING GIST(location);

-- Create spatial index on orders.work_location
CREATE INDEX idx_orders_work_location ON orders USING GIST(work_location);

-- Composite index for common queries
CREATE INDEX idx_users_location_role ON users(location) WHERE roles @> ARRAY['CONTRACTOR']::user_role[];
```

### Caching

**Cache radius search results:**

```typescript
@Injectable()
export class GeolocationService {
  constructor(
    @InjectRedis() private redis: Redis,
    private prisma: PrismaService,
  ) {}

  async findUsersWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    filters?: any,
  ): Promise<User[]> {
    // Create cache key
    const cacheKey = `geo:users:${centerLat.toFixed(2)}:${centerLng.toFixed(2)}:${radiusKm}:${JSON.stringify(filters)}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database
    const users = await this.performRadiusSearch(centerLat, centerLng, radiusKm, filters);

    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(users));

    return users;
  }
}
```

### Query Optimization Tips

1. **Use bounding box for initial filter:**
   ```sql
   -- First filter with bounding box (fast), then calculate exact distance
   WHERE 
     ST_MakeEnvelope(minLng, minLat, maxLng, maxLat, 4326) && location
     AND ST_DWithin(location::geography, center::geography, radius)
   ```

2. **Limit results:**
   ```sql
   LIMIT 50  -- Don't return thousands of results
   ```

3. **Use partial indexes:**
   ```sql
   CREATE INDEX idx_active_contractors 
   ON users(location) 
   WHERE roles @> ARRAY['CONTRACTOR'] AND is_active = true;
   ```

---

## API Endpoints

### Search Nearby Users

**Endpoint:** `GET /api/v1/geo/nearby-users`

**Query Params:**
```typescript
{
  lat: number;
  lng: number;
  radius: number; // in km (default: 10)
  role?: 'CONTRACTOR' | 'CLIENT';
  categories?: string[]; // comma-separated
  minRating?: number;
}
```

**Response:**
```typescript
{
  users: [
    {
      id: string;
      name: string;
      avatar: string;
      rating: number;
      distance: number; // in km
      location: {
        lat: number; // fuzzy
        lng: number; // fuzzy
        accuracy: 'fuzzy' | 'city_only';
      };
    }
  ];
}
```

### Search Nearby Orders

**Endpoint:** `GET /api/v1/geo/nearby-orders`

**Query Params:**
```typescript
{
  lat: number;
  lng: number;
  radius: number;
  categories?: string[];
  minBudget?: number;
  maxBudget?: number;
}
```

---

## Environment Variables

```bash
# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSy...

# PostGIS (included in PostgreSQL connection)
DATABASE_URL="postgresql://user:pass@localhost:5432/hummii?schema=public"
```

---

**Last updated:** November 2, 2025  
**Status:** Ready for implementation  
**Priority:** MEDIUM
