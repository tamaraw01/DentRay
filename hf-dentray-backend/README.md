---
title: DentRay AI Backend
emoji: 🦷
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 6.16.0
python_version: "3.11"
app_file: app.py
pinned: false
suggested_hardware: cpu-basic
---

# DentRay AI Backend

Backend inference Gradio untuk skrining awal indikasi visual karies dari citra gigi.

DentRay hanya menjalankan model `.keras` yang sudah dilatih. Space ini tidak melakukan
training model.

## Struktur

```text
app.py
requirements.txt
README.md
models/
└── dentray_unet_model.keras
```

## Deploy ke Hugging Face Spaces

1. Buka Hugging Face dan buat Space baru.
2. Pilih SDK **Gradio**.
3. Pilih hardware **CPU Basic**.
4. Upload seluruh isi folder `hf-dentray-backend/` ke root repository Space.
5. Pastikan model tersedia di `models/dentray_unet_model.keras`.
6. Tunggu proses build dan status Space menjadi **Running**.
7. Buka **Use via API** atau **View API** untuk memastikan endpoint `/predict` tersedia.

Model berukuran besar. Gunakan Git LFS saat push melalui Git:

```bash
git lfs install
git lfs track "models/dentray_unet_model.keras"
git add .gitattributes models/dentray_unet_model.keras
git commit -m "Add DentRay inference model"
git push
```

## API Gradio

Endpoint publik:

```text
/predict
```

Contoh Python:

```python
from gradio_client import Client, handle_file

client = Client("username/space-name")
result = client.predict(
    image=handle_file("foto-gigi.png"),
    api_name="/predict",
)

response_json = result[-1]
print(response_json)
```

Contoh JavaScript:

```javascript
import { Client, handle_file } from "@gradio/client";

const client = await Client.connect("https://username-space-name.hf.space");
const result = await client.predict("/predict", [handle_file(file)]);
const responseJson = result.data[result.data.length - 1];
```

Response JSON kompatibel dengan dashboard frontend DentRay:

- `original_preview`
- `predicted_mask`
- `overlay`
- `segmented_area_pixels`
- `segmented_area_percentage`
- `interpretation_level`
- `interpretation_text`
- `recommendations`
- `disclaimer`
- `warnings`

## Environment Frontend

Tambahkan URL Space ke Vercel:

```env
NEXT_PUBLIC_AI_BACKEND_URL=https://username-space-name.hf.space
```

Kosongkan `NEXT_PUBLIC_API_BASE_URL` jika frontend harus memakai Hugging Face sebagai
backend utama.

## Catatan

- Free Space dapat tidur saat tidak digunakan. Request pertama dapat mengalami cold start.
- Gunakan Space publik agar frontend Vercel dapat memanggil API tanpa token.
- Source code dan model pada Space publik dapat dilihat dan di-clone oleh publik.
- Gambar diproses untuk inference dan tidak disimpan permanen oleh kode DentRay.
- Hasil merupakan skrining awal dan bukan pengganti pemeriksaan dokter gigi.
