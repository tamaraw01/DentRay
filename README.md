# DentRay

DentRay adalah aplikasi gratis untuk skrining awal indikasi karies gigi dari foto HP. Pengguna dapat mengambil foto atau upload gambar, lalu DentRay menampilkan area yang dicurigai dalam bentuk mask dan overlay merah.

DentRay bukan diagnosis dokter. Hasil perlu dikonfirmasi melalui pemeriksaan dokter gigi.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend produksi: Hugging Face Spaces, Gradio, TensorFlow/Keras
- Backend fallback: FastAPI
- Auth dan data: Supabase
- Model: U-Net segmentasi karies yang sudah dilatih dari notebook

## Struktur Utama

```text
frontend/             Aplikasi web DentRay
hf-dentray-backend/   Space Gradio untuk inference publik
backend/              FastAPI fallback
supabase/             SQL schema tabel dan RLS
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

## Backend Produksi

Backend produksi menggunakan Gradio Space tanpa Docker. Endpoint inference publik:

```text
/predict
```

Kode Space berada di `hf-dentray-backend/`. Folder `backend/` tetap tersedia sebagai
fallback FastAPI lama, tetapi bukan target deployment utama.

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
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_AI_BACKEND_URL=https://username-space-name.hf.space
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari project Supabase. `NEXT_PUBLIC_SUPABASE_ANON_KEY` hanya fallback untuk project lama. Jangan taruh service role key atau secret key di frontend.

Frontend memakai FastAPI jika `NEXT_PUBLIC_API_BASE_URL` diisi. Jika env tersebut kosong
dan `NEXT_PUBLIC_AI_BACKEND_URL` tersedia, frontend memakai Hugging Face Gradio.

## Model U-Net

Model produksi Hugging Face berada di:

```text
hf-dentray-backend/models/dentray_unet_model.keras
```

Salinan model FastAPI fallback berada di:

```text
backend/models/dentray_unet_model.keras
```

Aplikasi tidak melakukan training model. Backend hanya memuat model `.keras` dengan
`compile=False` untuk inference segmentasi karies.

Ukuran model saat ini sekitar 372 MB, sehingga file harus disimpan menggunakan Git LFS jika repository dipush ke GitHub:

```bash
git lfs install
git lfs track "hf-dentray-backend/models/dentray_unet_model.keras"
git add .gitattributes hf-dentray-backend/models/dentray_unet_model.keras
```

Konfigurasi tracking sudah tersedia di `.gitattributes`.

## Mascot Frontend

Mascot final DentRay disimpan di:

```text
frontend/public/mascot/dentray-mascot.png
```

Frontend menampilkan mascot melalui `next/image` dengan dimensi stabil dan ukuran
responsif. Welcome dan dashboard memuat gambar lebih awal, sedangkan penggunaan lain
tetap mengikuti lazy loading bawaan Next.js. Animasi mascot hanya memakai transform
CSS ringan dan berhenti saat pengguna mengaktifkan reduced motion.

Sebelum dikirim ke backend, citra diperkecil secara proporsional dengan sisi terpanjang
maksimal `512px` dan kualitas JPEG `0.9`. Backend tetap menangani preprocessing model
sesuai ukuran input model.

## Setup Supabase

1. Buat project Supabase.
2. Buka Authentication dan aktifkan Email Auth.
3. Jalankan SQL di [supabase/schema.sql](supabase/schema.sql).
4. Isi env frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_AI_BACKEND_URL=https://username-space-name.hf.space
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

## Deployment Backend ke Hugging Face Spaces

1. Buat Space baru di Hugging Face.
2. Pilih SDK **Gradio**.
3. Pilih hardware gratis **CPU Basic**.
4. Upload seluruh isi folder `hf-dentray-backend/` ke root repository Space.
5. Pastikan model ada di `models/dentray_unet_model.keras`.
6. Tunggu build selesai dan status Space menjadi **Running**.
7. Buka **View API** dan pastikan endpoint `/predict` tersedia.

Detail lengkap tersedia di
[hf-dentray-backend/README.md](hf-dentray-backend/README.md).

Free Space dapat tidur ketika tidak digunakan. Analisis pertama setelah idle dapat
membutuhkan waktu lebih lama karena cold start dan proses load model.

Space perlu dibuat publik agar frontend Vercel dapat memanggil API tanpa token. Source
code dan model pada Space publik dapat dilihat dan di-clone oleh publik.

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
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_AI_BACKEND_URL=https://username-space-name.hf.space
NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` hanya fallback untuk project Supabase lama dan tidak wajib diisi. Jangan pernah memasukkan secret key atau service role key ke Vercel frontend.

Kosongkan atau hapus `NEXT_PUBLIC_API_BASE_URL` agar Hugging Face dipilih sebagai
backend. Karena model tidak dibutuhkan frontend, Git LFS dapat dinonaktifkan pada
**Vercel Project Settings > Git** agar build tidak mengunduh file model.

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

1. Buka URL Space dan unggah citra contoh.
2. Pastikan Foto, Mask, Overlay, percentage, dan interpretation muncul.
3. Buka **View API** dan tes endpoint `/predict`.
4. Pastikan output terakhir berisi response JSON DentRay.

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

## Security Deployment

- File `.env`, `.env.local`, dan variasi environment lain diabaikan oleh `.gitignore`.
- Hanya `.env.example` yang boleh masuk repository.
- Secret key dan service role key Supabase tidak digunakan frontend.
- Jangan commit token Vercel, token Hugging Face, password, atau private key.
- Space publik tidak membutuhkan token Hugging Face pada frontend.
- Gunakan environment variables dari dashboard Vercel.
- Gambar skrining tidak disimpan permanen kecuali penyimpanan diaktifkan secara eksplisit.

## Catatan Privacy

- Gambar digunakan untuk proses skrining.
- Riwayat tersimpan jika user login dan fitur riwayat aktif.
- Storage file gambar permanen belum diaktifkan. Saat ini response gambar dapat disimpan sebagai data URL untuk flow awal.

## Bagian Manual

- Upload isi `hf-dentray-backend/` ke Space Gradio.
- Pastikan `hf-dentray-backend/models/dentray_unet_model.keras` terunggah.
- Isi environment variable Supabase di Vercel.
- Isi `NEXT_PUBLIC_AI_BACKEND_URL` dengan URL `.hf.space`.
- Kosongkan `NEXT_PUBLIC_API_BASE_URL` saat memakai Hugging Face.
- Atur Site URL dan Redirect URLs di Supabase.
- Tambahkan contoh dataset ke `frontend/public/examples/tooth-original.png`, `tooth-mask.png`, dan `tooth-overlay.png` jika sudah tersedia.
- Jika ingin penyimpanan gambar produksi, siapkan Supabase Storage dan ubah helper upload dari data URL ke URL storage.

## Catatan Medis

DentRay adalah alat bantu skrining awal berbasis AI. Hasil yang ditampilkan merupakan indikasi visual dari segmentasi gambar dan bukan pengganti pemeriksaan dokter gigi. Hasil perlu dikonfirmasi melalui pemeriksaan klinis oleh tenaga kesehatan gigi.
