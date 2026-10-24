export type ComparisonStatus = 'positive' | 'neutral' | 'negative';

export interface ComparisonCell {
  status: ComparisonStatus;
  symbol: '✓' | '~' | '✗';
  noteAr?: string;
  noteEn?: string;
}

export interface ComparisonCriterion {
  id: string;
  featureNameAr: string;
  featureNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  dataSourceAr: string;
  verificationStatus: 'VERIFIED_PRODUCT_FACT' | 'CATEGORY_BENCHMARK';
  shaheeq: ComparisonCell;
  regularStrips: ComparisonCell;
  internalClips: ComparisonCell;
  nasalSpray: ComparisonCell;
}

export interface ComparisonColumnMeta {
  key: 'shaheeq' | 'regularStrips' | 'internalClips' | 'nasalSpray';
  labelAr: string;
  labelEn: string;
  isPrimaryBrand: boolean;
}

export const COMPARISON_COLUMNS: ComparisonColumnMeta[] = [
  { key: 'shaheeq', labelAr: 'شهيق المغناطيسي', labelEn: 'SHAHEEQ Magnetic', isPrimaryBrand: true },
  { key: 'regularStrips', labelAr: 'اللزق العادي', labelEn: 'Regular Strips', isPrimaryBrand: false },
  { key: 'internalClips', labelAr: 'المشابك الداخلية', labelEn: 'Internal Clips', isPrimaryBrand: false },
  { key: 'nasalSpray', labelAr: 'بخاخات الأنف', labelEn: 'Nasal Sprays', isPrimaryBrand: false },
];

export const FOUR_REASONS_TO_CHOOSE = [
  {
    id: 'reason-1',
    number: '1',
    titleAr: 'سحب مغناطيسي ثابت',
    titleEn: 'Strong Magnetic Hold',
    descriptionAr: 'يفتح الأنف من الخارج بالمغناطيس بدون ما يفك وقت النوم.',
    descriptionEn: 'Opens your nose from the outside and stays put all night.',
  },
  {
    id: 'reason-2',
    number: '2',
    titleAr: '4 مقاسات في كل عبوة',
    titleEn: '4 Sizes in Every Box',
    descriptionAr: 'معاك 4 مقاسات عشان تختار المقاس المريح لأنفك بسهولة.',
    descriptionEn: 'Includes 4 clip sizes so you get a comfortable fit.',
  },
  {
    id: 'reason-3',
    number: '3',
    titleAr: 'ثبات 24 ساعة (30 يوم)',
    titleEn: '24-Hour Hold (30 Days)',
    descriptionAr: 'كل لاصقة بتعيش يوم كامل بثبات قوي — احتراماً لوقتك وعقلك.',
    descriptionEn: 'Each tab holds for up to 24 hours—30 full days per pack.',
  },
  {
    id: 'reason-4',
    number: '4',
    titleAr: 'آمن ومن غير أدوية',
    titleEn: '100% Drug-Free',
    descriptionAr: 'حل مريح للنوم والرياضة بدون أي تعوّد أو آثار جانبية.',
    descriptionEn: 'Safe for daily sleep and sports with zero side effects.',
  },
];

export const comparisonCriteria: ComparisonCriterion[] = [
  {
    id: 'magnetic-mechanism',
    featureNameAr: 'قوة فتح مجرى الأنف',
    featureNameEn: 'Airflow Opening Power',
    descriptionAr: 'توسيع خارجي بالمغناطيس',
    descriptionEn: 'External magnetic pull',
    dataSourceAr: 'مواصفات شهيق',
    verificationStatus: 'VERIFIED_PRODUCT_FACT',
    shaheeq: { status: 'positive', symbol: '✓', noteAr: 'مغناطيس ثابت', noteEn: 'Strong magnet' },
    regularStrips: { status: 'negative', symbol: '✗', noteAr: 'شد ضعيف', noteEn: 'Weak pull' },
    internalClips: { status: 'negative', symbol: '✗', noteAr: 'مزعج بالداخل', noteEn: 'Uncomfortable' },
    nasalSpray: { status: 'negative', symbol: '✗', noteAr: 'مؤقت', noteEn: 'Temporary' },
  },
  {
    id: 'multi-size-included',
    featureNameAr: '4 مقاسات في العبوة',
    featureNameEn: '4 Sizes Included',
    descriptionAr: 'صغير، متوسط، كبير، XL',
    descriptionEn: 'S, M, L, XL included',
    dataSourceAr: 'محتويات العبوة',
    verificationStatus: 'VERIFIED_PRODUCT_FACT',
    shaheeq: { status: 'positive', symbol: '✓', noteAr: '4 مقاسات', noteEn: '4 sizes' },
    regularStrips: { status: 'negative', symbol: '✗', noteAr: 'مقاس واحد', noteEn: '1 size' },
    internalClips: { status: 'neutral', symbol: '~', noteAr: 'مقاس ثابت', noteEn: 'Fixed size' },
    nasalSpray: { status: 'neutral', symbol: '~' },
  },
  {
    id: 'applicator-tool',
    featureNameAr: 'ثبات اللاصق 24 ساعة',
    featureNameEn: '24-Hour Adhesive Hold',
    descriptionAr: '30 يوم استخدام كاملين',
    descriptionEn: '30 full days of use',
    dataSourceAr: 'ضمان شهيق',
    verificationStatus: 'VERIFIED_PRODUCT_FACT',
    shaheeq: { status: 'positive', symbol: '✓', noteAr: '24 ساعة (30 يوم)', noteEn: '24h (30 days)' },
    regularStrips: { status: 'negative', symbol: '✗', noteAr: 'يفك مع العرق', noteEn: 'Peels with sweat' },
    internalClips: { status: 'negative', symbol: '✗', noteAr: 'يقع أثناء النوم', noteEn: 'Falls out' },
    nasalSpray: { status: 'negative', symbol: '✗' },
  },
  {
    id: 'drug-free-assist',
    featureNameAr: 'أداة تثبيت مغناطيسية',
    featureNameEn: 'Magnetic Applicator Tool',
    descriptionAr: 'تركيب سريع',
    descriptionEn: 'Fast placement',
    dataSourceAr: 'محتويات العبوة',
    verificationStatus: 'VERIFIED_PRODUCT_FACT',
    shaheeq: { status: 'positive', symbol: '✓', noteAr: 'مرفقة بالعلبة', noteEn: 'Included' },
    regularStrips: { status: 'negative', symbol: '✗', noteAr: 'يدوي فقط', noteEn: 'Manual only' },
    internalClips: { status: 'negative', symbol: '✗' },
    nasalSpray: { status: 'negative', symbol: '✗' },
  },
  {
    id: 'daily-routine-versatility',
    featureNameAr: 'بدون أدوية أو تعوّد',
    featureNameEn: 'Drug-Free & Safe Daily',
    descriptionAr: 'آمن يومياً',
    descriptionEn: 'Safe for daily use',
    dataSourceAr: 'آلية العمل',
    verificationStatus: 'VERIFIED_PRODUCT_FACT',
    shaheeq: { status: 'positive', symbol: '✓', noteAr: 'آمن 100%', noteEn: '100% Safe' },
    regularStrips: { status: 'positive', symbol: '✓' },
    internalClips: { status: 'positive', symbol: '✓' },
    nasalSpray: { status: 'negative', symbol: '✗', noteAr: 'يسبب تعوّد', noteEn: 'Causes rebound' },
  },
];
