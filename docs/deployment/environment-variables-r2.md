# Environment Variables Configuration for Cloudflare R2

После замены AWS S3 на Cloudflare R2, необходимо обновить environment variables в файле `/api/.env`:

## Старые переменные (AWS S3) - УДАЛИТЬ:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<aws_key>
AWS_SECRET_ACCESS_KEY=<aws_secret>
AWS_S3_BUCKET=hummii-bucket
AWS_CLOUDFRONT_DOMAIN=d123456.cloudfront.net
```

## Новые переменные (Cloudflare R2) - ДОБАВИТЬ:

```bash
# Cloudflare R2 (S3-compatible)
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<your_r2_access_key_id>
R2_SECRET_ACCESS_KEY=<your_r2_secret_access_key>
R2_BUCKET_NAME=hummii-production
R2_PUBLIC_URL=https://pub-<random>.r2.dev
# Or custom domain: R2_PUBLIC_URL=https://cdn.hummii.ca
```

## Как получить credentials:

См. подробную инструкцию в: `/docs/deployment/cloudflare-r2-setup.md`

Кратко:
1. https://dash.cloudflare.com → R2
2. Create bucket → `hummii-production`
3. Manage R2 API Tokens → Create API token
4. Permissions: Object Read & Write
5. Скопируй Access Key ID и Secret Access Key
6. Скопируй S3 API Endpoint из bucket details
7. Включи Public Access для получения R2_PUBLIC_URL

---

**Важно:** Secret Access Key показывается только один раз! Сохрани в безопасное место.

