Давайте изучу текущую документацию проекта, чтобы дать вам комплексные рекомендации по геолокации с учетом всех требований безопасности и законодательства Канады.

[5 tools called]

Отлично! Изучив документацию проекта Hummii, могу дать вам комплексные рекомендации по системе геолокации с учетом безопасности и канадского законодательства.

## 🗺️ Рекомендации по реализации геолокации для Hummii

### **1. Определение локации пользователя**

Рекомендую **многоуровневый подход** с приоритетами:

**Приоритет 1: Ручной ввод (обязательный при регистрации)**
- Город/провинция - обязательное поле
- Почтовый индекс - опционально
- Это базовый уровень для тех, кто не даст доступ к GPS

**Приоритет 2: Geolocation API (с согласия пользователя)**
- Запрашивать при первом входе на карту поиска
- Повышает точность результатов
- **Важно**: только после explicit consent (PIPEDA требование)

**Приоритет 3: IP-геолокация (fallback, только город/провинция)**
- Использовать только для определения города по умолчанию
- **Не хранить IP-адреса** без consent
- Использовать для предложения: "Похоже, вы из Торонто?"

### **2. Показ локации - принцип минимизации данных**

**Для исполнителей (публичная видимость):**
- По умолчанию: **Район/город** (например, "Downtown Toronto" или "Mississauga")
- **НЕ показывать точный адрес** никогда
- Настройка видимости в профиле:
  ```
  □ Показывать мой город (Toronto)
  □ Показывать район (Downtown, Etobicoke)
  □ Скрыть локацию (только онлайн-услуги)
  ```

**Для клиентов:**
- При создании заказа: выбор района или почтовый индекс (первые 3 символа)
- Точный адрес передавать только после принятия отклика (в приватном чате)

**Для карты:**
- Исполнители отображаются как маркеры в радиусе ~500м от реальной позиции (fuzzy location)
- Точная локация раскрывается только после установления контакта

### **3. Фильтр "Радиус поиска"**

```typescript
// Рекомендуемые опции фильтра
const radiusOptions = [
  { label: "В пределах 5 км", value: 5 },
  { label: "В пределах 10 км", value: 10 },
  { label: "В пределах 25 км", value: 25 },
  { label: "Весь город", value: 50 },
  { label: "Вся провинция", value: null },
  { label: "Онлайн-услуги", value: "remote" }
];
```

**Логика:**
- По умолчанию: 10 км (для городских районов)
- Для сельской местности: автоматически расширять до 50 км
- Для онлайн-услуг: радиус не применяется

### **4. Онлайн-услуги (remote services)**

**Обязательно добавить:**
- Отдельная категория/фильтр "Онлайн-услуги"
- Примеры: графический дизайн, консультации, обучение, программирование
- У исполнителя в настройках:
  ```
  Тип услуг:
  ☑ Локальные услуги (требуется присутствие)
  ☑ Онлайн-услуги (удалённо)
  ```

### **5. Что делать, если пользователь отказал в доступе к геолокации**

**Критически важно для PIPEDA compliance!**

#### **Сценарий A: Исполнитель отказал в доступе**
```typescript
// Fallback chain
1. Использовать город из профиля (обязательное поле при регистрации)
2. Показать уведомление: 
   "Для отображения на карте разрешите доступ к локации или укажите район вручную"
3. Предложить ручной выбор района из списка
4. Исполнитель может работать БЕЗ геолокации, если предлагает только онлайн-услуги
```

#### **Сценарий B: Клиент отказал в доступе**
```typescript
1. Использовать город из профиля
2. Показать карту с центром на городе
3. Предложить ввести почтовый индекс или выбрать район вручную
4. Фильтр радиуса переключить на "Весь город" по умолчанию
5. Клиент может искать по категориям БЕЗ карты
```

#### **Важно: Никогда не блокировать функционал!**
- Платформа должна работать **полностью без GPS**
- GPS - это enhancement, а не requirement

---

## 📋 Рекомендуемая структура Location System

```markdown
## Location System

### 1. Location Detection Methods
├─ **Manual Input** (primary, required at registration)
│  ├─ City/Province (mandatory)
│  ├─ Postal Code (optional)
│  └─ Neighborhood/District (optional)
│
├─ **Geolocation API** (optional, with explicit consent)
│  ├─ Request on first map access
│  ├─ Show clear consent dialog
│  ├─ Store preference in localStorage
│  └─ Allow to revoke anytime in settings
│
└─ **IP Geolocation** (fallback only)
   ├─ Use only to suggest city
   ├─ Never store IP addresses
   └─ Use service: ipapi.co or GeoJS

### 2. Map Integration
├─ **Google Maps API** (recommended for Canada)
│  ├─ Geocoding API - convert addresses to coordinates
│  ├─ Places API - autocomplete for addresses
│  ├─ Distance Matrix API - calculate distances
│  └─ Maps JavaScript API - display map
│
├─ **Alternative: Mapbox** (cost-effective for high traffic)
│  ├─ Better pricing for large scale
│  └─ More customizable UI
│
└─ **Map Features**
   ├─ Clustered markers for contractors
   ├─ Fuzzy location (±500m radius)
   ├─ Filter by category on map
   └─ Click marker → open contractor profile

### 3. Search Radius Filter
├─ Within 5 km
├─ Within 10 km (default for urban)
├─ Within 25 km
├─ Entire city (~50 km)
├─ Entire province
└─ Remote/Online services only

### 4. Online Services Category
├─ Service types: Design, Consulting, Tutoring, Programming
├─ No location requirement
├─ Filter: "Remote Only" checkbox
└─ Contractor setting: "I offer online services"

### 5. Privacy & Location Visibility Settings
├─ Contractor settings:
│  ├─ [ ] Show on map (default: ON)
│  ├─ [ ] Show city (default: ON)
│  ├─ [ ] Show neighborhood (default: ON)
│  └─ [ ] Hide location (online services only)
│
├─ Client settings:
│  ├─ Share location with contractors (after accepting bid)
│  └─ Show approximate location in order (postal code first 3 digits)
│
└─ Privacy rules:
   ├─ NEVER show exact address publicly
   ├─ Share precise location only in private chat
   └─ Allow location data deletion (PIPEDA Right to Erasure)

### 6. Geolocation Consent Flow

#### For Contractors:
1. During registration → select city (mandatory)
2. On first profile edit → prompt: "Show on map? Allow location access?"
3. If denied → fallback to city/neighborhood dropdown
4. Settings → toggle "Show on map" anytime

#### For Clients:
1. During registration → select city (mandatory)
2. On first search/map view → prompt: "Find nearby contractors? Allow location?"
3. If denied → fallback to city-wide search
4. Can search by category without map

#### Consent Dialog (PIPEDA compliant):
```
┌─────────────────────────────────────────────┐
│  Allow Location Access?                     │
├─────────────────────────────────────────────┤
│  We use your location to show nearby        │
│  contractors and relevant services.         │
│                                             │
│  • Your exact address is never shared       │
│  • You can change this anytime in Settings  │
│  • This is optional - you can search        │
│    by city instead                          │
│                                             │
│  [Learn More]  [Not Now]  [Allow]          │
└─────────────────────────────────────────────┘
```

### 7. Technical Implementation

#### Backend (NestJS):
```typescript
// location.entity.ts
@Entity()
export class Location {
  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  province: string;

  @Column({ nullable: true })
  postalCode: string; // Store only first 3 chars (FSA)

  @Column({ nullable: true })
  neighborhood: string;

  // Fuzzy coordinates (not exact)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number; // ±0.005 random offset

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number; // ±0.005 random offset

  @Column({ default: true })
  showOnMap: boolean;

  @Column({ default: false })
  offersOnlineServices: boolean;
}

// location.service.ts
@Injectable()
export class LocationService {
  // Search contractors within radius
  async findContractorsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    categoryId?: string
  ) {
    // Use PostGIS or raw SQL with Haversine formula
    const query = `
      SELECT *, 
        ( 6371 * acos( cos( radians(${latitude}) ) 
        * cos( radians( latitude ) ) 
        * cos( radians( longitude ) - radians(${longitude}) ) 
        + sin( radians(${latitude}) ) 
        * sin( radians( latitude ) ) 
        ) ) AS distance
      FROM contractors
      WHERE show_on_map = true
      HAVING distance < ${radiusKm}
      ORDER BY distance;
    `;
  }

  // Add fuzzy offset to protect privacy
  fuzzyLocation(lat: number, lng: number): { lat: number; lng: number } {
    const offset = 0.005; // ~500m
    return {
      lat: lat + (Math.random() - 0.5) * offset,
      lng: lng + (Math.random() - 0.5) * offset,
    };
  }
}
```

#### Frontend (Next.js):
```typescript
// hooks/useGeolocation.ts
export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user previously gave consent
    const consent = localStorage.getItem('geo_consent');
    setHasConsent(consent === 'granted');
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    // Show consent dialog first
    const userConsent = await showConsentDialog();
    
    if (!userConsent) {
      localStorage.setItem('geo_consent', 'denied');
      setHasConsent(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        localStorage.setItem('geo_consent', 'granted');
        setHasConsent(true);
      },
      (err) => {
        setError(err.message);
        // Fallback to IP geolocation or manual input
      }
    );
  };

  return { location, error, hasConsent, requestLocation };
}
```

### 8. Data Storage & Retention (PIPEDA)
├─ Store only necessary location data
├─ Fuzzy coordinates (not exact GPS)
├─ Postal code: only FSA (first 3 chars)
├─ Allow user to delete location data
├─ Don't log IP addresses without consent
└─ Retention: delete on account deletion
```

---

## 🎯 Мои конкретные рекомендации для Hummii:

### **Используйте Google Maps API**
- Лучшая поддержка канадских адресов
- Отличный автокомплит для адресов
- Проверенная надежность

### **Обязательные настройки для PIPEDA:**
1. ✅ Сделать GPS опциональным (fallback на город)
2. ✅ Explicit consent dialog перед запросом локации
3. ✅ Показывать только район/город публично
4. ✅ Хранить размытые координаты (fuzzy location ±500m)
5. ✅ Возможность полностью скрыть локацию
6. ✅ Удаление данных геолокации при удалении аккаунта

### **Структура базы данных:**
```sql
-- contractors table
city VARCHAR(100) NOT NULL,
province VARCHAR(50) NOT NULL,
postal_code_fsa CHAR(3), -- Only first 3 chars
neighborhood VARCHAR(100),
latitude DECIMAL(10,7), -- Fuzzy (±500m)
longitude DECIMAL(10,7), -- Fuzzy (±500m)
show_on_map BOOLEAN DEFAULT true,
offers_online_services BOOLEAN DEFAULT false,
geo_consent_given BOOLEAN DEFAULT false,
geo_consent_date TIMESTAMP
```

### **UI/UX Flow:**
1. Регистрация → выбор города (обязательно)
2. Первый визит на карту → consent dialog
3. Отказ → переключение на поиск по категориям
4. В профиле → настройки видимости локации

---

Хотите, чтобы я создал полную документацию по геолокации в файле `/docs/api/geolocation.md` на основе этих рекомендаций?