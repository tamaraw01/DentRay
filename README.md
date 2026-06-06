# DentRay

DentRay adalah aplikasi gratis untuk skrining awal indikasi karies gigi dari foto HP. Pengguna dapat mengambil foto atau upload gambar, lalu DentRay menampilkan area yang dicurigai dalam bentuk mask dan overlay merah.

DentRay bukan diagnosis dokter. Hasil perlu dikonfirmasi melalui pemeriksaan dokter gigi.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, TensorFlow/Keras, NumPy, Pillow, OpenCV
- Auth dan data: Supabase
- Model: U-Net segmentasi karies yang sudah dilatih dari notebook

## Struktur Utama

```text
frontend/   Aplikasi web DentRay
backend/    API inference U-Net
supabase/   SQL schema tabel dan RLS
```

## Route Frontend

- `/` landing page
- `/login`
- `/signup`
- `/forgot-password`
- `/app` homepage pribadi
- `/app/scan` scan gigi multi-view
- `/app/history`
- `/app/history/[id]`
- `/app/profile`
- `/about`
- `/how-it-works`
- `/disclaimer`

## Route Backend

- `GET /health`
- `POST /predict`

`POST /predict` menerima `multipart/form-data` dengan field `file`.

## Menjalankan Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend berjalan di:

```text
http://localhost:8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Tes prediksi:

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/foto-gigi.jpg"
```

## Menjalankan Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend berjalan di:

```text
http://localhost:3000
```

## Env Frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari project Supabase. `NEXT_PUBLIC_SUPABASE_ANON_KEY` hanya fallback untuk project lama. Jangan taruh service role key atau secret key di frontend.

## Env Backend

```env
APP_NAME=DentRay
APP_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
MODEL_PATH=models/dentray_unet_model.keras
```

## Model U-Net

Letakkan model hasil training notebook di:

```text
backend/models/dentray_unet_model.keras
```

Format utama backend adalah `.keras`. File `.h5` tidak digunakan jika kosong.

Aplikasi tidak melakukan training model. Backend hanya memuat model `.keras` untuk inference segmentasi karies.

Ukuran model saat ini sekitar 372 MB, sehingga file harus disimpan menggunakan Git LFS jika repository dipush ke GitHub:

```bash
git lfs install
git lfs track "backend/models/dentray_unet_model.keras"
git add .gitattributes backend/models/dentray_unet_model.keras
```

Konfigurasi tracking sudah tersedia di `.gitattributes`. Pastikan object Git LFS berhasil terunggah sebelum deploy ke Render.

## Setup Supabase

1. Buat project Supabase.
2. Buka Authentication dan aktifkan Email Auth.
3. Jalankan SQL di [supabase/schema.sql](supabase/schema.sql).
4. Isi env frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Gunakan publishable key dari Supabase Connect atau Settings > API Keys. `NEXT_PUBLIC_SUPABASE_ANON_KEY` boleh diisi hanya jika project masih memakai legacy anon key.

Tabel:

- `profiles`
- `scan_sessions`
- `scan_results`

RLS sudah disiapkan agar user hanya membaca dan menulis data miliknya sendiri.

SQL schema yang perlu dijalankan:

```sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  total_images integer not null default 0,
  highest_indication text not null,
  summary text not null
);

create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.scan_sessions(id) on delete cascade,
  view_type text not null,
  original_image_url text,
  mask_image_url text,
  overlay_image_url text,
  segmented_area_percentage numeric not null default 0,
  interpretation_level text not null,
  interpretation_text text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.scan_sessions enable row level security;
alter table public.scan_results enable row level security;
```

Untuk policy lengkap, jalankan file [supabase/schema.sql](supabase/schema.sql) agar semua policy RLS dan grant ikut dibuat.

## Test Auth

Daftar akun:

1. Jalankan frontend.
2. Buka `http://localhost:3000`.
3. Klik `Daftar`.
4. Isi nama, email, dan password.
5. Jika email confirmation aktif, cek inbox. Jika tidak aktif, aplikasi masuk ke `/app`.

Login:

1. Buka `http://localhost:3000/?mode=signin`.
2. Isi email dan password.
3. Setelah berhasil, user masuk ke `/app`.

Logout:

1. Buka `/app/profile`.
2. Klik `Keluar`.
3. Aplikasi kembali ke `/`.

Proteksi route:

- `/app`, `/app/scan`, `/app/history`, dan `/app/profile` diproteksi oleh `frontend/src/proxy.ts`.
- Jika belum login, user diarahkan ke `/`.
- Session disinkronkan dengan cookie Supabase melalui `@supabase/ssr`.

## Deployment Backend ke Render

Repository sudah memiliki [render.yaml](render.yaml). Blueprint tersebut menggunakan:

- Root Directory: `backend`
- Runtime: Python
- Python: `3.12`, dipin melalui `backend/.python-version`
- Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health Check: `/health`
- Region: Singapore
- Instance: Standard

Instance Standard dipilih karena TensorFlow dan model `.keras` membutuhkan memori lebih besar daripada instance 512 MB. Periksa biaya Render sebelum membuat Blueprint.

Langkah deploy:

1. Push repository beserta object Git LFS model ke GitHub, GitLab, atau Bitbucket.
2. Di Render pilih **New > Blueprint**.
3. Hubungkan repository dan gunakan `render.yaml` di root.
4. Isi `ALLOWED_ORIGINS` dengan origin frontend Vercel, tanpa trailing slash.
5. Deploy dan tunggu sampai `/health` dapat diakses.

Environment variable Render:

```env
APP_NAME=DentRay
APP_ENV=production
MODEL_PATH=models/dentray_unet_model.keras
ALLOWED_ORIGINS=https://nama-project.vercel.app
```

Untuk beberapa origin, pisahkan dengan koma:

```env
ALLOWED_ORIGINS=https://dentray.example.com,https://nama-project.vercel.app
```

Render mengisi `PORT` secara otomatis. Jangan membuat nilai `PORT` manual.

## Deployment Frontend ke Vercel

Konfigurasi frontend tersedia di `frontend/vercel.json`.

Di Vercel:

1. Import repository.
2. Set **Root Directory** ke `frontend`.
3. Pilih Framework Preset **Next.js**.
4. Build Command menggunakan `npm run build`.
5. Output Directory biarkan default Next.js.
6. Isi environment variable untuk Production dan Preview.

Environment variable Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://nama-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` hanya fallback untuk project Supabase lama dan tidak wajib diisi. Jangan pernah memasukkan secret key atau service role key ke Vercel frontend.

Karena model backend menggunakan Git LFS tetapi tidak dibutuhkan frontend, Git LFS dapat dinonaktifkan pada **Vercel Project Settings > Git** agar build frontend tidak mengunduh model.

Deploy dari Git dilakukan otomatis setelah push. Untuk deploy manual dari directory frontend:

```bash
cd frontend
npx vercel
npx vercel --prod
```

## Supabase Production URL

Di Supabase buka **Authentication > URL Configuration**:

- Site URL: `https://domain-production-dentray`
- Redirect URL production: `https://domain-production-dentray/**`
- Redirect URL local: `http://localhost:3000/**`
- Untuk preview Vercel, tambahkan pola `https://*-nama-akun.vercel.app/**` jika diperlukan.

Gunakan URL production yang tepat sebagai Site URL agar konfirmasi email dan reset password tidak kembali ke localhost.

SQL schema tetap dijalankan dari:

```text
supabase/schema.sql
```

## Mobile dan Add to Home Screen

Frontend menyediakan web app manifest dasar di `frontend/src/app/manifest.ts`. Aplikasi dapat ditambahkan ke home screen melalui menu browser mobile.

Belum ada service worker atau offline cache. Fitur kamera hanya bekerja pada:

- deployment HTTPS
- `localhost` saat development

Uji tampilan pada viewport sekitar `390 x 844` sebelum publikasi.

## Testing Production

Backend:

```bash
curl https://nama-backend.onrender.com/health

curl -X POST https://nama-backend.onrender.com/predict \
  -F "file=@/path/to/foto-gigi.jpg"
```

Frontend:

1. Buka URL Vercel melalui browser incognito.
2. Akses `/app` dan pastikan user tanpa session kembali ke `/`.
3. Daftar akun baru dan selesaikan verifikasi email jika aktif.
4. Masuk dan pastikan diarahkan ke `/app`.
5. Uji kamera melalui HTTPS.
6. Uji upload JPG atau PNG, preview, lalu analisis.
7. Pastikan hasil Foto, Mask, dan Overlay tampil.
8. Buka profil, klik `Keluar`, lalu pastikan `/app` kembali terlindungi.
9. Uji ulang pada perangkat mobile.

Jika frontend mendapat error CORS, periksa bahwa `ALLOWED_ORIGINS` di Render sama persis dengan origin Vercel.

## Security Deployment

- File `.env`, `.env.local`, dan variasi environment lain diabaikan oleh `.gitignore`.
- Hanya `.env.example` yang boleh masuk repository.
- Secret key dan service role key Supabase tidak digunakan frontend.
- Jangan commit token Vercel, token Render, password, atau private key.
- Gunakan environment variables dari dashboard Vercel dan Render.
- Gambar skrining tidak disimpan permanen kecuali penyimpanan diaktifkan secara eksplisit.

## Catatan Privacy

- Gambar digunakan untuk proses skrining.
- Riwayat tersimpan jika user login dan fitur riwayat aktif.
- Storage file gambar permanen belum diaktifkan. Saat ini response gambar dapat disimpan sebagai data URL untuk flow awal.

## Disclaimer Medis

DentRay hanya membantu skrining awal. DentRay bukan pengganti pemeriksaan dokter gigi. Hasil bisa dipengaruhi kualitas foto dan perlu dikonfirmasi oleh dokter gigi.

## Bagian Manual

- Pastikan `backend/models/dentray_unet_model.keras` terunggah melalui Git LFS.
- Isi environment variable Supabase di Vercel.
- Isi `NEXT_PUBLIC_API_BASE_URL` dengan URL Render.
- Isi `ALLOWED_ORIGINS` di Render dengan URL Vercel.
- Atur Site URL dan Redirect URLs di Supabase.
- Tambahkan contoh dataset ke `frontend/public/examples/tooth-original.png`, `tooth-mask.png`, dan `tooth-overlay.png` jika sudah tersedia.
- Jika ingin penyimpanan gambar produksi, siapkan Supabase Storage dan ubah helper upload dari data URL ke URL storage.

## Catatan Medis

DentRay adalah alat bantu skrining awal berbasis AI. Hasil yang ditampilkan merupakan indikasi visual dari segmentasi gambar dan bukan pengganti pemeriksaan dokter gigi. Hasil perlu dikonfirmasi melalui pemeriksaan klinis oleh tenaga kesehatan gigi.
