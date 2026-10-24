# تدقيق الأصول البصرية وصور المنتج (`product-asset-audit.md`)

توثق هذه الوثيقة نتائج الفحص الفعلي لجميع الصور المستخرجة من صفحة **المصدر B** (`https://4yoou.myeasyorders.com/products/magnetic-nasal-dilator`) وتصنيفها وفق قواعد القسم 14 لمنع تضارب العلامات التجارية الخارجية وضمان أعلى جودة بصرية في صفحة **شهيق (SHAHEEQ)**.

---

## 1. تدقيق صور معرض المنتج الرئيسي (Primary Gallery Assets on `files.easy-orders.net`)

| # | رابط الصورة الأصلي في المصدر B | الأبعاد | المحتوى المرصود | التصنيف | القرار المتخذ في الواجهة الجديدة |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `https://files.easy-orders.net/1791921739769359659.jpg` | `800×1200` | رسم توضيحي لخطوات الاستخدام الثلاث: `Proper Application: Three Easy Steps (1. Clean your nose, 2. Apply your Tabs, 3. Attach your Band)` | `GENERIC_DEMONSTRATION_ASSET` | تم تحويل المحتوى إلى شريحة تعليمية عربية/إنجليزية عالية الدقة ضمن معرض الهيرو (الخطوات الثلاث للتثبيت المغناطيسي) بهوية متسقة. |
| 2 | `https://files.easy-orders.net/1791921739757996415.jpg` | `800×1200` | مقارنة بصرية لتدفق الهواء أثناء النوم قبل وبعد ارتداء المشبك المغناطيسي | `GENERIC_DEMONSTRATION_ASSET` | تم تمثيلها في شريحة الاستخدام الليلي والتوضيح الميكانيكي لتوسيع فتحات الأنف. |
| 3 | `https://files.easy-orders.net/1791921740199351126.jpg` | `800×1200` | جدول المقاسات الأربعة للمشابك الأنفية (`Small, Medium, Large, X-Large` / `S1, S2, M1, M2`) | `VERIFIED_PRODUCT_ASSET` | تم بناء مخطط هندسي واضح للمقاسات الأربعة ضمن المعرض الرئيسي وقسم محتويات العبوة. |
| 4 | `https://files.easy-orders.net/1791921739763668703.jpg` | `800×1200` | استخدام المشبك المغناطيسي في الجيم والتمارين مع عرض مكونات الطقم | `GENERIC_DEMONSTRATION_ASSET` | تم تمثيلها في شريحة الأداء الرياضي ومعرض السياقات اليومية. |
| 5 | `https://files.easy-orders.net/1791921739760710899.jpg` | `800×1200` | صورة شاملة لمحتويات الطقم (30 لاصقة مغناطيسية + 4 مشابك + أداة التثبيت) | `VERIFIED_PRODUCT_ASSET` | تم اعتماد التكوين الكامل للطقم في الشريحة الأولى للمعرض وفي قسم «إيه الموجود في العبوة؟». |

---

## 2. تدقيق الصور المضمّنة داخل الوصف (Inline Description Images on `images.openai.com`)

أظهر الفحص البرمجي (`playwright-cli eval`) أن الصور الثماني المضمّنة في وصف صفحة المصدر B مستوردة من نتائج بحث عامة وتحمل شعارات علامات تجارية خارجية متضاربة:

| # | النص البديل (`alt`) المرصود في DOM المصدر B | العلامة الظاهرة على العبوة في الصورة | التصنيف | سبب الاستبعاد / المعالجة |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `Nasal Dilator Intake Breathing Nasal Strip Starter Kit \| MercadoLivre` | `MAGNETIC NASAL STRIPS / 4beauty` | `CONFLICTING_THIRD_PARTY_BRAND_ASSET` | تحمل شعار `4beauty` بالأسفل — تم استبدالها برسوم طقم `شهيق / SHAHEEQ` الموحدة لمنع تشتيت العميل. |
| 2 | `Airbreaze Pro – ORIGINAL` | `MAGNETIC NASAL DILATOR / BETTER BREATHE` | `CONFLICTING_THIRD_PARTY_BRAND_ASSET` | تحمل علامة `BETTER BREATHE` التجارية — تم استبعاد عرض الشعار الخارجي واستخلاص تكوين الطقم الأسود فقط. |
| 3 | `Intake Starter Kit` | صورة قريبة للأنف مع المشبك المغناطيسي الأسود | `GENERIC_DEMONSTRATION_ASSET` | لقطة توضيحية بدون شعار متضارب؛ تم تمثيل زاوية التثبيت على جسر الأنف بدقة. |
| 4 | `Cerotti nasali magnetici...` | شخص نائم يرتدي الموسّع المغناطيسي الأبيض | `GENERIC_DEMONSTRATION_ASSET` | لقطة توضيحية للاستخدام أثناء النوم. |
| 5 | `TIYA Nasal Dilator Kit – 30 Day Supply for Sleep & Sport – TIYA Fitness` | `TIYA NASAL DILATORS` | `CONFLICTING_THIRD_PARTY_BRAND_ASSET` | تحمل شعار `TIYA` الأزرق الصريح — تم حجبها بالكامل التزامًا بالقسم 14.3 لمنع التضارب البصري. |
| 6 | `Magnetic Nasal Strips for Breathing \| Reusable nasal strips` | استخدام صباحي/منزلي للموسّع المغناطيسي | `GENERIC_DEMONSTRATION_ASSET` | تمثيل سياق الروتين اليومي في القسم المخصص. |
| 7 | `Magnetic Nasal Strip \| Breathing Dilators ... – Pure Oxygen` | صورة المشابك الأربعة `S1, S2, M1, M2` مع اللواصق | `VERIFIED_PRODUCT_ASSET` | توضح تدريج المقاسات الأربعة `S1, S2, M1, M2`؛ تم تضمين هذا التدريج حرفيًا في رسوم محتويات الطقم. |
| 8 | `Nasal Breathing Dilator Set – Anti Snoring Device ... – Trendhub Pakistan` | `WHAT'S IN STARTER KIT (4 Sizes + Applicators + 15-pair intake tabs)` | `GENERIC_DEMONSTRATION_ASSET` | توضح تقسيم الطقم (4 مقاسات + أداة المغناطيس + 30 لاصقة فردية أي 15 زوجًا)؛ تم تعريبها وتوحيد هويتها البصرية. |

---

## 3. معايير الجودة البصرية المطبقة في البناء الجديد

1. **توحيد الهوية البصرية (`Brand C: شهيق / SHAHEEQ`):** جميع الرسوم المتجهية والمخططات التوضيحية في الصفحة تستخدم شعار `/assets/aistudio/SHAHEEQ_7efd1b94.svg` ولوحة الألوان المعتمدة (`#01181E`, `#CEF90B`, `#070707`, `#EAE6DF`).
2. **التمثيل الهندسي الدقيق للمنتج الفعلي:**
   - **اللواصق المغناطيسية (30 قطعة):** دوائر لاصقة طبية بلون البشرة/شفافة بمركز معدني مغناطيسي دقيق.
   - **المشابك الأنفية (4 مقاسات S1, S2, M1, M2):** قوس مرن أسود مطفي مزود بنقطتي جذب مغناطيسي في الطرفين لرفع جانبي الأنف من الخارج.
   - **أداة التثبيت المخصصة (Magnetic Applicator):** أداة أسطوانية مدمجة لالتقاط اللواصق المغناطيسية وتثبيتها بدقة على جانبي الأنف.
