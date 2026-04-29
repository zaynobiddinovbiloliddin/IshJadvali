# Ish Jadvali Dashboard

Mobil-first ish jadvali boshqaruv paneli. Loyiha xodimlar va haftalik studiya smenalarini mock backend bilan boshqaradi.

## Imkoniyatlar

- Haftalik jadval ko'rish va hafta bo'yicha yurish
- Jadval yaratish, o'chirish va xodim statusini o'zgartirish
- Xodimlarni qo'shish, tahrirlash va o'chirish
- Jamoa, hisobot, profil va bildirishnomalar sahifalari
- Lokal file-backed mock DB: `data/mock-db.json`
- Vercel serverless mock backend: `/api/*`

## Ishga tushirish

```bash
npm install
npm run api
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3001`

## Production

```bash
npm run build
npm start
```

`npm start` build qilingan frontendni va `/api/*` endpointlarni bitta Node server orqali serve qiladi.

## API

- `GET /api/dashboard?weekStart=YYYY-MM-DD`
- `POST /api/schedules/generate`
- `GET /api/schedules`
- `GET /api/schedules/:weekStart`
- `DELETE /api/schedules/:weekStart`
- `PUT /api/schedules/:weekStart/status`
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

Mock backend demo va prototip uchun mo'ljallangan. Real kompaniya ma'lumotlari uchun Postgres yoki boshqa persistent DB ulash kerak.
