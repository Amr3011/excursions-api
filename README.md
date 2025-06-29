# واجهة برمجة تطبيق إدارة الرحلات السياحية

## نبذة عن المشروع

هذا المشروع عبارة عن واجهة برمجة تطبيقات (API) لإدارة الرحلات السياحية، ويتضمن إدارة المدن والفنادق والطرق والعملات والجنسيات وغيرها من البيانات المتعلقة بالرحلات السياحية.

## التقنيات المستخدمة

- Node.js / Express: إطار عمل الخادم
- MS SQL Server: قاعدة البيانات
- JWT: للمصادقة والتفويض

## المتطلبات الأساسية

1. Node.js (الإصدار 14.0.0 أو أعلى)
2. MS SQL Server
3. إنشاء ملف `.env` في المجلد الرئيسي للمشروع

## التثبيت

1. استنساخ المشروع:

```bash
git clone https://github.com/yourusername/excursions-api.git
cd excursions-api
```

2. تثبيت التبعيات:

```bash
npm install
```

3. إعداد ملف `.env`:

```
PORT=5000
DB_SERVER=your_db_server
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
```

4. تشغيل الخادم:

```bash
npm start
```

أو في وضع التطوير:

```bash
npm run watch
```

## هيكل المشروع

```
excursions-api/
├── src/
│   ├── config/         # ملفات الإعدادات والتكوين
│   ├── controllers/    # وحدات التحكم لمعالجة الطلبات
│   ├── middleware/     # وسائط المعالجة
│   ├── models/         # نماذج البيانات
│   ├── routes/         # تعريفات المسارات
│   ├── utils/          # أدوات مساعدة
│   └── server.js       # نقطة البداية للخادم
├── .env                # متغيرات البيئة (غير مشمولة في مستودع Git)
├── .gitignore
├── package.json
└── README.md
```

## واجهات API المتاحة

### الفنادق

- `GET /api/hotels`: الحصول على جميع الفنادق
- `GET /api/hotels/:code`: الحصول على فندق محدد
- `GET /api/hotels/search?term=...`: البحث عن فندق
- `POST /api/hotels`: إنشاء فندق جديد
- `PUT /api/hotels/:code`: تحديث بيانات فندق
- `DELETE /api/hotels/:code`: حذف فندق

### المدن

- `GET /api/cities`: الحصول على جميع المدن
- `GET /api/cities/:code`: الحصول على مدينة محددة
- `GET /api/cities/search?term=...`: البحث عن مدينة
- `POST /api/cities`: إنشاء مدينة جديدة
- `PUT /api/cities/:code`: تحديث بيانات مدينة
- `DELETE /api/cities/:code`: حذف مدينة

### الجنسيات

- `GET /api/nationalities`: الحصول على جميع الجنسيات
- `GET /api/nationalities/:code`: الحصول على جنسية محددة
- `GET /api/nationalities/search?term=...`: البحث عن جنسية
- `POST /api/nationalities`: إنشاء جنسية جديدة
- `PUT /api/nationalities/:code`: تحديث بيانات جنسية
- `DELETE /api/nationalities/:code`: حذف جنسية

### الطرق

- `GET /api/roads`: الحصول على جميع الطرق
- `GET /api/roads/:cityCode/:roadCode`: الحصول على طريق محدد
- `GET /api/roads/city/:cityCode`: الحصول على طرق مدينة محددة
- `GET /api/roads/search?term=...`: البحث عن طريق
- `POST /api/roads`: إنشاء طريق جديد
- `PUT /api/roads/:cityCode/:roadCode`: تحديث بيانات طريق
- `DELETE /api/roads/:cityCode/:roadCode`: حذف طريق

### العملات

- `GET /api/currencies`: الحصول على جميع العملات
- `GET /api/currencies/:code`: الحصول على عملة محددة
- `GET /api/currencies/search?term=...`: البحث عن عملة
- `POST /api/currencies`: إنشاء عملة جديدة
- `PUT /api/currencies/:code`: تحديث بيانات عملة
- `DELETE /api/currencies/:code`: حذف عملة

## المساهمة

لا تتردد في المساهمة في هذا المشروع. يمكنك إرسال pull requests أو فتح issues للمناقشة.

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
