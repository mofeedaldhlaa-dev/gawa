# ملاحظة النقل → المشروع الرئيسي (Jawad Net ERP / gawa-updated)

انسخ هذه التعليمات للـ agent في المشروع الرئيسي **بعد** استيراد الكود من GitHub.

## 1) الكود
تم استيراده من GitHub (backend/server.py ~4361 سطر + 27 صفحة واجهة). لا حاجة لتعديل يدوي.

## 2) متغيّرات البيئة المطلوبة (backend/.env)
الخادم يتطلّب `JWT_SECRET` وإلا لن يُقلع. أبقِ `MONGO_URL` و `DB_NAME` المُدارَين من المنصّة كما هما، وأضِف:
```
JWT_SECRET="<ولّد سلسلة عشوائية 64 حرف hex>"
```
(اختياري بقيم افتراضية: ADMIN_EMAIL / ADMIN_USERNAME / ADMIN_PASSWORD / COMPANY_NAME / COMPANY_PHONE)

## 3) التبعيات
- Backend: `requirements.txt` كما هو (كل الحزم مثبتة عادةً). شغّل `pip install -r requirements.txt` عند اللزوم.
- Frontend: `yarn install` (تبعيات جديدة: jspdf, jspdf-autotable, html2canvas, html-to-image, idb).
- تأكّد أن `@emergentbase/overlay` باقٍ في devDependencies بـ package.json.

## 4) قاعدة البيانات (لا تُنقل عبر Git — يدوية)
دَمب البيانات (jawad_net_db: users, customers, cards, sales, settings...) غير موجود في المستودع عمداً.
إن أردت نفس البيانات، انقل مجلد الدَمب يدوياً ثم:
```
mongorestore --uri="$MONGO_URL" \
  --nsFrom='jawad_net_db.*' --nsTo='<DB_NAME الحالية>.*' \
  --dir=/path/to/backup
```
> إعادة تسمية المجال إلى DB_NAME المُدارة تُبقي `.env` سليماً. الاستعادة إلى قاعدة فارغة = إضافية وآمنة.

## 5) التشغيل والتحقق
```
sudo supervisorctl restart backend frontend
```
- سجّل الدخول عبر `/mof30` (مدير) و `/` (نافذة GAWAD NET العامة).
- تحقق أن نقاط API تُرجع 200 (customers/cards/sales/stock).

## بيانات الاعتماد
- كلمات مرور حسابات الدَمب الحقيقية (MOF/MOK) غير معروفة — لا تُخمَّن.
- عند أول إقلاع يُنشأ مدير افتراضي تلقائياً (اسم/كلمة مرور يظهران في سجل الخادم) — استخدمه ثم بدّله.
