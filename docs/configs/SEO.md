Давайте посмотрю на ваш технологический стек, чтобы дать наиболее подходящие рекомендации для SEO.

[2 tools called]

Отлично! Вижу, что вы используете **Next.js** для фронтенда. Это идеальный выбор для SEO. Вот мои рекомендации:

## 1. Уникальные URL для профилей (Slug-based URLs)

Для Next.js лучший подход:

**App Router (Next.js 13+):**
```typescript
// app/performer/[slug]/page.tsx
export async function generateStaticParams() {
  const performers = await getPerformers();
  return performers.map((performer) => ({
    slug: performer.slug, // e.g., "ivan-designer-moscow"
  }));
}

export default function PerformerProfile({ params }: { params: { slug: string } }) {
  // Your component logic
}
```

**На бэкенде (NestJS):**
- При создании профиля автоматически генерируйте slug из имени + города
- Используйте библиотеку `slugify` для транслитерации
- Храните slug в БД с уникальным индексом
- Добавляйте числовой суффикс при дублировании (-2, -3)

```typescript
import slugify from 'slugify';

function generateSlug(name: string, city: string): string {
  const baseSlug = slugify(`${name} ${city}`, {
    lower: true,
    strict: true,
    locale: 'ru', // для кириллицы
  });
  // Check uniqueness and add suffix if needed
  return baseSlug;
}
```

## 2. OpenGraph для соцсетей

**В Next.js используйте Metadata API:**

```typescript
// app/performer/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const performer = await getPerformerBySlug(params.slug);
  
  return {
    title: `${performer.name} - ${performer.profession} | Hummy`,
    description: performer.bio.substring(0, 160),
    openGraph: {
      title: `${performer.name} - ${performer.profession}`,
      description: performer.bio.substring(0, 160),
      url: `https://hummy.com/performer/${params.slug}`,
      siteName: 'Hummy',
      images: [
        {
          url: performer.avatar,
          width: 1200,
          height: 630,
          alt: performer.name,
        },
      ],
      locale: 'en_CA', // Канада
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${performer.name} - ${performer.profession}`,
      description: performer.bio.substring(0, 160),
      images: [performer.avatar],
    },
  };
}
```

**Важно для изображений:**
- OG изображения должны быть 1200x630px
- Используйте CDN (CloudFront/Cloudinary)
- Сжимайте для быстрой загрузки

## 3. Sitemap.xml

**Next.js имеет встроенную поддержку:**

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const performers = await getAllPerformers();
  const categories = await getAllCategories();
  
  const performerUrls = performers.map((performer) => ({
    url: `https://hummy.com/performer/${performer.slug}`,
    lastModified: performer.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  const categoryUrls = categories.map((category) => ({
    url: `https://hummy.com/category/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));
  
  return [
    {
      url: 'https://hummy.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://hummy.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...performerUrls,
    ...categoryUrls,
  ];
}
```

**Дополнительно:**
- Для больших каталогов (>50k страниц) создавайте sitemap index
- Обновляйте динамически при добавлении новых профилей
- Отправьте в Google Search Console

## 4. Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/chat/',
          '/messages/',
          '/settings/',
          '/auth/',
          '/payment/',
        ],
      },
    ],
    sitemap: 'https://hummy.com/sitemap.xml',
  };
}
```

## 5. Дополнительные рекомендации для SEO

### Структурированные данные (JSON-LD)

```typescript
// В компоненте профиля
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: performer.name,
  jobTitle: performer.profession,
  image: performer.avatar,
  url: `https://hummy.com/performer/${performer.slug}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: performer.city,
    addressCountry: 'CA',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: performer.rating,
    reviewCount: performer.reviewCount,
  },
};

// В JSX
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### Canonical URLs

```typescript
// В metadata
canonical: `https://hummy.com/performer/${params.slug}`,
```

### Оптимизация производительности

- **ISR (Incremental Static Regeneration):** обновляйте профили каждые 24 часа
```typescript
export const revalidate = 86400; // 24 hours
```

- **Ленивая загрузка изображений:** используйте `next/image`
- **Кэширование:** используйте Redis для популярных профилей

### Multilingual SEO (если планируете)

```typescript
// app/[locale]/performer/[slug]/page.tsx
export async function generateMetadata({ params }) {
  return {
    alternates: {
      languages: {
        'en-CA': `https://hummy.com/en/performer/${params.slug}`,
        'fr-CA': `https://hummy.com/fr/performer/${params.slug}`,
      },
    },
  };
}
```

## Итого для вашего проекта:

1. ✅ **Slug-based URLs** - автогенерация из имени + города
2. ✅ **OpenGraph** - через Next.js Metadata API
3. ✅ **Sitemap.xml** - динамический через `app/sitemap.ts`
4. ✅ **Robots.txt** - через `app/robots.ts`
5. ✅ **JSON-LD** - структурированные данные для богатых сниппетов
6. ✅ **ISR** - для актуальности без полной перегенерации

Хотите, чтобы я создал полный пример документации по SEO для вашего проекта?