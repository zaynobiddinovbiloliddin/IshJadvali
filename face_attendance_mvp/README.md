# Face Attendance MVP

Python, OpenCV, `face_recognition` va SQLite asosida kamera orqali xodimni tanib, check-in/check-out yozadigan sodda MVP.

## Arxitektura

- `db.py` - SQLite connection, jadvallar va employee/attendance query funksiyalari.
- `face_service.py` - kamera ochish, yuz encoding olish, database'dagi encodinglar bilan solishtirish.
- `register_face.py` - xodimni kamera orqali ro'yxatdan o'tkazish CLI.
- `attendance.py` - real vaqt kamera attendance, kunlik/xodim hisobotlari va CSV export CLI.
- `attendance_service.py` - check-in/check-out biznes logikasi va hisobot funksiyalari.
- `main.py` - React yoki boshqa frontend ulanishi uchun FastAPI endpointlar.
- `attendance.db` - dastur ishga tushganda avtomatik yaratiladigan SQLite database.

Database:

```text
employees
- id
- name
- face_encoding

attendance
- id
- employee_id
- date
- check_in
- check_out
- total_seconds
```

## O'rnatish

macOS/Linux:

```bash
cd face_attendance_mvp
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

macOS Apple Silicon'da `dlib` build xatosi chiqsa, avval system dependencylarni o'rnating:

```bash
/opt/homebrew/bin/brew install cmake libpng pkg-config
PATH="/opt/homebrew/bin:$PATH" pip install -r requirements.txt
```

Windows:

```bash
cd face_attendance_mvp
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

> `face_recognition` `dlib`ga bog'liq. Agar o'rnatishda xatolik bo'lsa, CMake, libpng va C++ build tools kerak bo'lishi mumkin.

## Xodimni ro'yxatdan o'tkazish

```bash
python register_face.py --name "Ali Valiyev"
```

Kamera oynasi ochiladi:

- Yuz kamera oldida aniq ko'rinsin.
- Faqat bitta odam tursin.
- `SPACE` bosilsa yuz encoding olinadi va database'ga saqlanadi.
- `Q` bosilsa jarayon bekor qilinadi.

## Attendance kamerani ishga tushirish

```bash
python attendance.py
```

Ishlash tartibi:

- Xodim birinchi marta tanilsa, bugungi `check_in` yoziladi.
- Xodim bugun kirgan, lekin chiqmagan bo'lsa, keyingi tanilishda `check_out` yoziladi.
- `check_out - check_in` asosida `total_seconds` hisoblanadi.
- Xodim bugun allaqachon kirib-chiqqan bo'lsa, qayta yozilmaydi.
- Kamera oynasini yopish uchun `Q` bosing.

Kamera index o'zgartirish:

```bash
python attendance.py --camera 1
```

Yuz moslik chegarasini o'zgartirish:

```bash
python attendance.py --tolerance 0.45
```

Kamroq qiymat qattiqroq tekshiradi, kattaroq qiymat esa yumshoqroq tekshiradi.

## Hisobotlar

Kunlik hisobot:

```bash
python attendance.py --daily-report 2026-05-03
```

Xodim bo'yicha hisobot:

```bash
python attendance.py --employee-report 1
```

CSV export:

```bash
python attendance.py --export-csv attendance_report.csv
```

## FastAPI

API ishga tushirish:

```bash
uvicorn main:app --reload
```

Endpointlar:

```text
POST /employees/register
GET  /employees
GET  /attendance
GET  /attendance/today
GET  /attendance/report
POST /recognize
```

`POST /employees/register` `multipart/form-data` kutadi:

- `name`: xodim ismi
- `image`: kamera orqali olingan rasm fayli

API dokumentatsiya:

```text
http://127.0.0.1:8000/docs
```

## Xavfsizlik va real loyiha eslatmalari

- Database'ga oddiy rasm saqlanmaydi, faqat face encoding saqlanadi.
- Xodimlardan biometrik ma'lumotdan foydalanish uchun yozma rozilik olish kerak.
- Real production loyihada liveness detection kerak: oddiy rasm, video yoki telefon ekranidan aldashni bloklash uchun.
- Database faylini serverda himoyalangan joyda saqlang va backup qiling.
- Production API uchun authentication, role-based access, HTTPS va audit log qo'shing.

## Ko'p uchraydigan xatoliklar

### Kamera ochilmadi

Yechim:

- Boshqa dastur kamerani band qilmaganini tekshiring.
- OS camera permission'ni yoqing.
- `--camera 1` yoki boshqa index bilan urinib ko'ring.

### `face_recognition` yoki `dlib` o'rnatilmadi

Yechim:

- CMake o'rnating.
- Windows'da Visual Studio Build Tools o'rnating.
- Python 3.10 yoki 3.11 ishlatish tavsiya qilinadi.

### Yuz topilmadi

Yechim:

- Yorug'likni yaxshilang.
- Kamera yuzga to'g'ri qaragan bo'lsin.
- Ko'zoynak, maska yoki kuchli soyani kamaytiring.

### Bir nechta yuz topildi

Yechim:

- Ro'yxatdan o'tkazishda kamera oldida faqat bitta xodim tursin.

### Xodim noto'g'ri tanildi

Yechim:

- `--tolerance 0.45` kabi pastroq qiymat ishlating.
- Har bir xodimni yaxshi yorug'likda qayta ro'yxatdan o'tkazing.
- Real loyihada bir nechta encoding saqlash va sifat nazoratini qo'shish kerak.
