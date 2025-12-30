# QuickS3 / QuickS3

> A lightweight, VS Code-like web editor for S3 / MinIO buckets.
> MinIO / S3 objects can be browsed and edited directly in the browser using Monaco Editor.

---

## Features ✅
- Login & workspace (bucket/prefix) selection
- Hierarchical file explorer (tree view)
- Monaco Editor with tabs, syntax highlighting, and Save (Ctrl+S)
- Create / Rename / Delete objects (rename implemented as Copy + Delete)
- Client-side filename search
- Toast notifications & i18n (English / Turkish)
- Minimal Node.js + Express backend using the MinIO SDK

---

## Quick Start (development) 🔧
1. Clone the repo:

   ```bash
   git clone https://github.com/codedByCan/QuickS3.git
   cd QuickS3
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root (example below) and configure your MinIO/S3 credentials.

4. Start the server in development:

   ```bash
   npm run dev
   # or
   npm start
   ```

Open http://localhost:3000 and select a workspace (bucket + optional prefix).

---

## Environment (.env) example
Create a `.env` file in the project root with values appropriate for your MinIO/S3 instance:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USESSL=false
MINIO_ACCESS=minioadmin
MINIO_SECRET=minioadmin
SESSION_SECRET=change_me
PORT=3000
```

> Tip: For S3-compatible services, use the S3 endpoint and credentials.

---

## Docker (Production) 🐳
A Dockerfile is provided so you can build and run QuickS3 in a container.

Build the image:

```bash
docker build -t quicks3:latest .
```

Run the container (example):

```bash
docker run -d \
  -p 3000:3000 \
  -e MINIO_ENDPOINT=your-minio-host \
  -e MINIO_PORT=9000 \
  -e MINIO_USESSL=false \
  -e MINIO_ACCESS=minioaccess \
  -e MINIO_SECRET=miniosecret \
  -e SESSION_SECRET=change_me \
  --name quicks3 quicks3:latest
```

Healthcheck (container):

```bash
docker exec quicks3 curl -fsS http://localhost:3000/ || echo 'service down'
```

---

## API Endpoints (overview)
- `GET /api/minio/buckets` — list buckets
- `GET /api/minio/files/:bucket?prefix=` — list objects
- `GET /api/minio/file/:bucket?name=` — get object content
- `POST /api/minio/file/:bucket` — create/update object ({ name, content })
- `DELETE /api/minio/file/:bucket?name=` — delete object
- `POST /api/minio/rename/:bucket` — rename (copy + delete)

---

## Screenshots / Ekran Görüntüleri 📸

<img width="1919" height="895" alt="image" src="https://github.com/user-attachments/assets/27b33f80-3d34-4545-a831-bfe94c325958" />
<img width="1919" height="879" alt="image" src="https://github.com/user-attachments/assets/58a32949-56b5-4ab8-9bb5-4754d519ce3a" />
<img width="1912" height="915" alt="image" src="https://github.com/user-attachments/assets/ce726304-7b46-49d6-b357-616013fffedd" />


---

## Contributing 🤝
Contributions and issues are welcome. If you want, I can add CI (GitHub Actions) and basic tests.

When opening a pull request, include:
- Description of the change
- Any relevant screenshots
- How to reproduce / test

---

## License
Add a license file (e.g., MIT) if you plan to make this project public.

---

---

# QuickS3 / QuickS3 (Türkçe)

> Hafif, VS Code benzeri bir web editörü — MinIO / S3 uyumlu.

## Özellikler ✅
- Giriş ve çalışma alanı (bucket/ön-ek) seçimi
- Hiyerarşik dosya gezgini
- Monaco editör: sekmeler, sözdizimi vurgulama, Kaydet (Ctrl+S)
- Oluşturma / Yeniden adlandırma / Silme (yeniden adlandırma: kopyala + sil)
- İstemci tarafı dosya araması
- Bildirimler ve çoklu dil desteği (EN/TR)
- Kolay çalıştırılabilen Node.js + Express + MinIO SDK

## Hızlı Başlangıç (geliştirme) 🔧
1. Depoyu klonlayın:

   ```bash
   git clone https://github.com/codedByCan/QuickS3.git
   cd QuickS3
   ```

2. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

3. Proje kökünde `.env` dosyasını oluşturun (örnek yukarıdadır) ve MinIO/S3 bilgilerinizi girin.

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   # veya
   npm start
   ```

Tarayıcıda http://localhost:3000 adresini açın ve bucket/klasör seçin.

## .env örneği
Aynı örnek yukarıda (EN) bölümünde bulunmaktadır.

## Docker (Prodüksiyon) 🐳
Docker ile çalıştırmak için:

```bash
docker build -t quicks3:latest .

docker run -d -p 3000:3000 \
  -e MINIO_ENDPOINT=your-minio-host \
  -e MINIO_PORT=9000 \
  -e MINIO_USESSL=false \
  -e MINIO_ACCESS=minioaccess \
  -e MINIO_SECRET=miniosecret \
  -e SESSION_SECRET=change_me \
  --name quicks3 quicks3:latest

```
