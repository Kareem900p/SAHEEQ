import type { PackageTier, ProductVariant } from '../utils/ecommerceMath';

export type ClaimVerificationLevel =
  | 'VERIFIED_PRODUCT_FACT'
  | 'SUPPORTED_BENEFIT'
  | 'SAFETY_DISCLAIMER';

export interface BenefitItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconType: 'airflow' | 'sleep' | 'ergonomic';
  claimClassification: ClaimVerificationLevel;
}

export interface GallerySlide {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  purposeAr: string;
  imageUrl: string;
  fallbackUrl: string;
  fitMode?: 'cover' | 'contain';
  renderType:
    | 'pouch-front'
    | 'pouch-back'
    | 'athlete-male'
    | 'athlete-female';
  referenceImageUrl?: string;
}

export interface AthleteSlide {
  id: string;
  sportAr: string;
  sportEn: string;
  contextAr: string;
  contextEn: string;
  tagAr: string;
  tagEn: string;
  accentColor: string;
  poseType:
    | 'sleep-routine'
    | 'sport-assist'
    | 'mild-congestion'
    | 'step-clean'
    | 'step-tabs'
    | 'step-band';
}

export interface PackageComponentItem {
  id: string;
  numberBadge: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  detailsAr: string;
  detailsEn: string;
  visualType: 'magnetic-tabs' | 'multi-size-clips' | 'applicator-tool';
}

export interface ReviewItem {
  id: string;
  authorNameAr: string;
  authorNameEn: string;
  roleOrContextAr: string;
  roleOrContextEn: string;
  tagAr: string;
  tagEn: string;
  rating: number;
  textAr: string;
  textEn: string;
  gender?: 'male' | 'female';
  categoryGroup?: 'sleep' | 'breathing' | 'sport' | 'setup';
  sceneType:
    | 'deep-sleep'
    | 'gym-workout'
    | 'padel-court'
    | 'running-night'
    | 'daily-work'
    | 'pro-recovery';
}

export interface MissingInputRecord {
  key: string;
  labelAr: string;
  currentFallbackBehaviorAr: string;
  status:
    | 'CONFIRMED_FROM_ASSET'
    | 'CONFIRMED_FROM_REFERENCE'
    | 'NEEDS_MERCHANT_CONFIRMATION';
}

export interface BrandConfigState {
  brandNameAr: string;
  brandNameEn: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  logoPrimaryPath: string;
  currencyCode: string;
  currencySymbolAr: string;
  currencySymbolEn: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  cairoShippingFee: number;
  otherGovShippingFee: number;
  deliveryEstimateAr: string;
  deliveryEstimateEn: string;
  fomoRemainingPacks: number;
  fomoWindowAr: string;
  fomoWindowEn: string;
  guaranteeLineAr: string;
  guaranteeLineEn: string;
  productCategoryAr: string;
  productCategoryEn: string;
  productTitleAr: string;
  productTitleEn: string;
  productSubtitleAr: string;
  productSubtitleEn: string;
  shortBenefitHeadlineAr: string;
  shortBenefitHeadlineEn: string;
  shortBenefitSubheadlineAr: string;
  shortBenefitSubheadlineEn: string;
  shortBenefitIntroAr: string;
  shortBenefitIntroEn: string;
  shortBenefitBulletsAr: string[];
  shortBenefitBulletsEn: string[];
  globalInStock: boolean;
  contactEmail: string;
  contactLocationAr: string;
  contactLocationEn: string;
  instagramHandle: string;
}

export const INITIAL_BRAND_CONFIG: BrandConfigState = {
  brandNameAr: 'شهيق',
  brandNameEn: 'SHAHEEQ',
  taglineAr: 'نَفَس أوسع.. نوم أعمق وتمرين أقوى.',
  taglineEn: 'Breathe Easy. Sleep Deep.',
  descriptionAr:
    'يفتح مجرى الأنف بهدوء عشان تنام بعمق وتتمرن بأعلى أداء من غير شخير أو كتمة.',
  descriptionEn:
    'Opens your nose gently so you sleep better and train harder without snoring.',
  logoPrimaryPath: '/assets/aistudio/SHAHEEQ_7efd1b94.svg',
  currencyCode: 'EGP',
  currencySymbolAr: 'ج.م',
  currencySymbolEn: 'EGP',
  freeShippingThreshold: 500,
  standardShippingFee: 85,
  cairoShippingFee: 85,
  otherGovShippingFee: 95,
  deliveryEstimateAr: '48 ساعة لباب البيت',
  deliveryEstimateEn: '48h Door Delivery',
  fomoRemainingPacks: 37,
  fomoWindowAr: 'خلال يومين',
  fomoWindowEn: 'for 2 days',
  guaranteeLineAr:
    'ضمان ثبات المغناطيس 24 ساعة = 30 يوم استخدام فعلي كامل.',
  guaranteeLineEn:
    '24-Hour Magnetic Hold Guarantee = 30 full days of real use.',
  productCategoryAr: 'تنفّس أسهل • نوم ورياضة',
  productCategoryEn: 'Easy Breathing • Sleep & Sport',
  productTitleAr: 'موسّع الأنف المغناطيسي',
  productTitleEn: 'Magnetic Nasal Dilator',
  productSubtitleAr: '30 لاصقة مغناطيسية + 4 مقاسات مشابك + أداة التثبيت',
  productSubtitleEn: '30 Magnetic Tabs + 4 Clip Sizes + Applicator Tool',
  shortBenefitHeadlineAr: 'محتويات كل عبوة:',
  shortBenefitHeadlineEn: 'Inside Every Pack:',
  shortBenefitSubheadlineAr: 'نَفَس مفتوح من أول ثانية بدون أدوية',
  shortBenefitSubheadlineEn: 'Instant airflow from second one, drug-free',
  shortBenefitIntroAr: '',
  shortBenefitIntroEn: '',
  shortBenefitBulletsAr: [
    '30 لاصقة مغناطيسية',
    '4 مقاسات مشابك',
    'أداة تركيب سريعة',
  ],
  shortBenefitBulletsEn: [
    '30 Magnetic Tabs',
    '4 Clip Sizes',
    'Quick Applicator',
  ],
  globalInStock: true,
  contactEmail: 'support@shaheeq.eg',
  contactLocationAr: 'القاهرة، مصر',
  contactLocationEn: 'Cairo, Egypt',
  instagramHandle: '@shaheeq.eg',
};

export const PRODUCT_PACKAGES: PackageTier[] = [
  {
    id: 'pkg-1',
    nameAr: 'عبوة واحدة (30 يوم)',
    nameEn: '1 Pack (30 Days)',
    packsCount: 1,
    stripsCount: 30,
    regularPrice: 420,
    salePrice: 320,
    currency: 'EGP',
    inStock: true,
  },
  {
    id: 'pkg-2',
    nameAr: 'عبوتين (60 يوم)',
    nameEn: '2 Packs (60 Days)',
    packsCount: 2,
    stripsCount: 60,
    regularPrice: 840,
    salePrice: 595,
    currency: 'EGP',
    inStock: true,
    isBestValue: true,
    badgeTextAr: 'أفضل عرض',
    badgeTextEn: 'Best Offer',
  },
  {
    id: 'pkg-3',
    nameAr: '3 عبوات (90 يوم)',
    nameEn: '3 Packs (90 Days)',
    packsCount: 3,
    stripsCount: 90,
    regularPrice: 1260,
    salePrice: 820,
    currency: 'EGP',
    inStock: true,
    badgeTextAr: 'أعلى توفير',
    badgeTextEn: 'Max Savings',
  },
];

export const PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 'black',
    nameAr: 'العبوة القياسية (4 مقاسات)',
    nameEn: 'Starter Kit (4 Sizes)',
    colorHex: '#070707',
    secondaryHex: '#CEF90B',
    inStock: true,
    stockCount: 37,
    audience: 'adults',
    descriptionAr: 'تشمل 4 مقاسات مشابك + 30 لاصقة + أداة التثبيت.',
  },
];

export const GALLERY_SLIDES: GallerySlide[] = [
  {
    id: 'slide-1',
    titleAr: 'عبوة شهيق المتكاملة (30 يوم)',
    titleEn: 'Complete 30-Day Starter Kit',
    subtitleAr: '30 لاصقة + 4 مقاسات مشابك + أداة التثبيت',
    subtitleEn: '30 Tabs + 4 Clip Sizes + Magnetic Tool',
    purposeAr: 'الصورة الأولى: عبوة شهيق المتكاملة',
    imageUrl: '/assets/products/slide-1.jpg',
    fallbackUrl: 'https://c.top4top.io/p_3948n7a521.jpg',
    fitMode: 'cover',
    renderType: 'pouch-front',
    referenceImageUrl: 'https://c.top4top.io/p_3948n7a521.jpg',
  },
  {
    id: 'slide-2',
    titleAr: '٣ خطوات سهلة للتركيب',
    titleEn: '3 Easy Steps to Use',
    subtitleAr: '١. نظّف أنفك • ٢. ضع اللواصق • ٣. ثبّت الموسّع',
    subtitleEn: '1. Clean nose • 2. Place tabs • 3. Attach clip',
    purposeAr: 'الصورة الثانية: خطوات الاستخدام الثلاث',
    imageUrl: '/assets/products/slide-2.jpg',
    fallbackUrl: 'https://f.top4top.io/p_3948a2h681.jpg',
    fitMode: 'cover',
    renderType: 'pouch-back',
    referenceImageUrl: 'https://f.top4top.io/p_3948a2h681.jpg',
  },
  {
    id: 'slide-3',
    titleAr: '4 مقاسات جوه كل عبوة',
    titleEn: '4 Sizes in Every Box',
    subtitleAr: 'صغير • متوسط • كبير • كبير جداً (XL)',
    subtitleEn: 'Small • Medium • Large • Extra Large (XL)',
    purposeAr: 'الصورة الثالثة: المقاسات الأربعة',
    imageUrl: '/assets/products/slide-3.jpg',
    fallbackUrl: 'https://d.top4top.io/p_3948b2lkn1.jpg',
    fitMode: 'contain',
    renderType: 'athlete-male',
    referenceImageUrl: 'https://d.top4top.io/p_3948b2lkn1.jpg',
  },
  {
    id: 'slide-4',
    titleAr: 'ماذا تحتوي مجموعة البداية؟',
    titleEn: 'What Is in the Starter Kit?',
    subtitleAr: '٤ مقاسات + أداة التثبيت + ١٥ زوجاً من لواصق 3M',
    subtitleEn: '4 Clip Sizes + Magnetic Tool + 15 Pairs of 3M Tabs',
    purposeAr: 'الصورة الرابعة: تفاصيل المحتويات',
    imageUrl: '/assets/products/slide-4.jpg',
    fallbackUrl: 'https://e.top4top.io/p_3948bozl01.jpg',
    fitMode: 'cover',
    renderType: 'athlete-female',
    referenceImageUrl: 'https://e.top4top.io/p_3948bozl01.jpg',
  },
  {
    id: 'slide-5',
    titleAr: 'ثبات مريح على الأنف طوال اليوم',
    titleEn: 'Comfortable All-Day Magnetic Fit',
    subtitleAr: 'تصميم انسيابي خفيف يفتح مجرى الهواء بهدوء وبدون أي ضغط',
    subtitleEn: 'Ergonomic magnetic bridge opens nasal airflow gently',
    purposeAr: 'الصورة الخامسة: شكل الموسع أثناء الاستخدام اليومي',
    imageUrl: '/assets/products/slide-5.jpg',
    fallbackUrl: 'https://g.top4top.io/p_3950guv8v1.jpg',
    fitMode: 'cover',
    renderType: 'athlete-female',
    referenceImageUrl: 'https://g.top4top.io/p_3950guv8v1.jpg',
  },
  {
    id: 'slide-6',
    titleAr: 'نوم عميق وهادئ بدون شخير',
    titleEn: 'Deep, Quiet Sleep Without Snoring',
    subtitleAr: 'ثبات ٢٤ ساعة حتى أثناء التقلب والنوم العميق طوال الليل',
    subtitleEn: '24-hour magnetic hold through deep night sleep',
    purposeAr: 'الصورة السادسة: استخدام شهيق أثناء النوم',
    imageUrl: '/assets/products/slide-6.jpg',
    fallbackUrl: 'https://f.top4top.io/p_3950wxouj1.jpg',
    fitMode: 'cover',
    renderType: 'athlete-male',
    referenceImageUrl: 'https://f.top4top.io/p_3950wxouj1.jpg',
  },
];

export interface CelebrityEndorsementItem {
  id: string;
  nameAr: string;
  nameEn: string;
  username: string;
  roleAr: string;
  roleEn: string;
  quoteAr: string;
  quoteEn: string;
  imageUrl: string;
  fallbackUrl: string;
  shapeBgHex: string;
  shapeBorderHex: string;
  tagBgHex: string;
  tagTextHex: string;
}

export const CELEBRITY_ENDORSEMENTS: CelebrityEndorsementItem[] = [
  {
    id: 'celeb-bahaa',
    nameAr: 'بهاء حنيش',
    nameEn: 'Bahaa Henish',
    username: '@bahaa.henish',
    roleAr: 'صانع محتوى',
    roleEn: 'Content Creator',
    quoteAr: 'بتتنفس 4K',
    quoteEn: 'Breathing in 4K',
    imageUrl: '/assets/celebrities/bahaa-henish.jpg',
    fallbackUrl: 'https://d.top4top.io/p_395011o3a1.jpg',
    shapeBgHex: '#DDFE01',
    shapeBorderHex: '#CEF90B',
    tagBgHex: '#01181E',
    tagTextHex: '#DDFE01',
  },
  {
    id: 'celeb-rizk',
    nameAr: 'رزق رسلان',
    nameEn: 'Dr. Rizk Raslan',
    username: '@rizkraslan.med',
    roleAr: 'صيدلي',
    roleEn: 'Pharmacist',
    quoteAr: 'تحسسك براحة وإنت شغال، بجد أنصح بيها.',
    quoteEn: 'Makes you feel so comfortable while working, I truly recommend it.',
    imageUrl: '/assets/celebrities/rizk-raslan.jpg',
    fallbackUrl: 'https://c.top4top.io/p_3950jalka1.jpg',
    shapeBgHex: '#6EE7B7',
    shapeBorderHex: '#34D399',
    tagBgHex: '#01181E',
    tagTextHex: '#6EE7B7',
  },
  {
    id: 'celeb-alaa',
    nameAr: 'علاء غزي',
    nameEn: 'Alaa Ghozy',
    username: '@alaa_ghozy',
    roleAr: 'صانع محتوى',
    roleEn: 'Content Creator',
    quoteAr: 'أخدتها معايا وأنا رايح الجيم.',
    quoteEn: 'Took it with me on my way to the gym.',
    imageUrl: '/assets/celebrities/alaa-ghozy.jpg',
    fallbackUrl: 'https://b.top4top.io/p_3950dpx2i1.jpg',
    shapeBgHex: '#7DD3FC',
    shapeBorderHex: '#38BDF8',
    tagBgHex: '#01181E',
    tagTextHex: '#7DD3FC',
  },
];

export const PRODUCT_BENEFITS: BenefitItem[] = [
  {
    id: 'ben-airflow',
    titleAr: 'نَفَس مفتوح فوراً',
    titleEn: 'Instant Open Airflow',
    descriptionAr: 'يوسّع الأنف من الخارج بالمغناطيس عشان تتنفس براحة من أول ثانية.',
    descriptionEn: 'Gently opens your nose from the outside for easy breathing right away.',
    iconType: 'airflow',
    claimClassification: 'VERIFIED_PRODUCT_FACT',
  },
  {
    id: 'ben-sleep',
    titleAr: 'نوم هادي وعميق',
    titleEn: 'Quiet, Deep Sleep',
    descriptionAr: 'يقلل التنفس من الفم والشخير عشان تصحى فايق ومرتاح.',
    descriptionEn: 'Reduces mouth breathing and snoring so you wake up fresh.',
    iconType: 'sleep',
    claimClassification: 'SUPPORTED_BENEFIT',
  },
  {
    id: 'ben-lightweight',
    titleAr: 'ثبات 24 ساعة (30 يوم)',
    titleEn: '24-Hour Hold (30 Days)',
    descriptionAr: 'لاصق طبي ثابت طول اليوم مع العرق والنوم — احتراماً لوقتك وعقلك.',
    descriptionEn: 'Medical-grade adhesive stays on through sweat and sleep for 30 full days.',
    iconType: 'ergonomic',
    claimClassification: 'VERIFIED_PRODUCT_FACT',
  },
];

export const ATHLETE_SLIDES: AthleteSlide[] = [
  {
    id: 'use-sleep',
    sportAr: '١. نوم أعمق بالليل',
    sportEn: '1. Better Night Sleep',
    contextAr: 'ودّع صحيان نص الليل ونشفان الريق.',
    contextEn: 'Stop waking up with a dry mouth at night.',
    tagAr: 'وقت النوم',
    tagEn: 'Night Sleep',
    accentColor: '#CEF90B',
    poseType: 'sleep-routine',
  },
  {
    id: 'use-sport',
    sportAr: '٢. نَفَس أطول في التمرين',
    sportEn: '2. Stronger Workouts',
    contextAr: 'أكسجين أكتر وثبات قوي مع العرق والحركة.',
    contextEn: 'More air and strong hold even when you sweat.',
    tagAr: 'الرياضة والجيم',
    tagEn: 'Gym & Sport',
    accentColor: '#38BDF8',
    poseType: 'sport-assist',
  },
  {
    id: 'use-congestion',
    sportAr: '٣. راحة من كتمة الأنف',
    sportEn: '3. Daily Nose Relief',
    contextAr: 'يفتح مجرى النفس فوراً من غير أي بخاخات.',
    contextEn: 'Opens blocked nasal passages without sprays.',
    tagAr: 'طول اليوم',
    tagEn: 'All Day',
    accentColor: '#10B981',
    poseType: 'mild-congestion',
  },
  {
    id: 'step-1',
    sportAr: 'خطوة ١: نظّف أنفك',
    sportEn: 'Step 1: Clean Nose',
    contextAr: 'امسح جانبي الأنف وجفّفهم كويس.',
    contextEn: 'Wipe and dry both sides of your nose.',
    tagAr: 'التركيب 1/3',
    tagEn: 'Step 1/3',
    accentColor: '#F59E0B',
    poseType: 'step-clean',
  },
  {
    id: 'step-2',
    sportAr: 'خطوة ٢: ضع اللواصق',
    sportEn: 'Step 2: Place Tabs',
    contextAr: 'ثبّت اللاصقة على كل جنب بالأداة المغناطيسية.',
    contextEn: 'Place one magnetic tab on each side of your nose.',
    tagAr: 'التركيب 2/3',
    tagEn: 'Step 2/3',
    accentColor: '#EC4899',
    poseType: 'step-tabs',
  },
  {
    id: 'step-3',
    sportAr: 'خطوة ٣: ركّب المشبك',
    sportEn: 'Step 3: Attach Clip',
    contextAr: 'قرّب المشبك وهيمسك في اللواصق بالمغناطيس فوراً.',
    contextEn: 'Snap the magnetic clip onto the tabs.',
    tagAr: 'التركيب 3/3',
    tagEn: 'Step 3/3',
    accentColor: '#A855F7',
    poseType: 'step-band',
  },
];

export const PACKAGE_COMPONENTS_LIST: PackageComponentItem[] = [
  {
    id: 'comp-tabs',
    numberBadge: '01',
    titleAr: '30 لاصقة مغناطيسية',
    titleEn: '30 Magnetic Tabs',
    subtitleAr: 'ثبات 24 ساعة = 30 يوم كاملين',
    subtitleEn: '24-hour hold = 30 full days',
    detailsAr: 'لواصق 3M ناعمة على البشرة وثابتة طول اليوم.',
    detailsEn: 'Soft 3M adhesive tabs that stay in place all day.',
    visualType: 'magnetic-tabs',
  },
  {
    id: 'comp-clips',
    numberBadge: '02',
    titleAr: '4 مقاسات للمشابك',
    titleEn: '4 Clip Sizes Included',
    subtitleAr: 'صغير • متوسط • كبير • XL',
    subtitleEn: 'Small • Medium • Large • XL',
    detailsAr: '4 مقاسات في نفس العلبة عشان تختار المقاس المريح لأنفك.',
    detailsEn: '4 reusable sizes in one box so you find your best fit.',
    visualType: 'multi-size-clips',
  },
  {
    id: 'comp-applicator',
    numberBadge: '03',
    titleAr: 'أداة التثبيت المغناطيسية',
    titleEn: 'Magnetic Applicator',
    subtitleAr: 'تركيب سهل في ثواني',
    subtitleEn: 'Easy placement in seconds',
    detailsAr: 'تلتقط اللاصقة وتثبتها في مكانها الصح بسهولة.',
    detailsEn: 'Picks up and places each tab cleanly without touching the glue.',
    visualType: 'applicator-tool',
  },
];

export const CUSTOMER_REVIEWS_DATA: ReviewItem[] = [
  // =========================================================================
  // PHASE 1: IMMEDIATE EMOTIONAL HOOK & CORE PAIN RELIEF (SPOUSE, SNORING, DRY MOUTH, SLEEP)
  // =========================================================================
  {
    id: 'rev-cro-1',
    authorNameAr: 'سارة م.',
    authorNameEn: 'Sara M.',
    roleOrContextAr: 'القاهرة • النوم',
    roleOrContextEn: 'Cairo • Night Sleep',
    tagAr: 'النوم',
    tagEn: 'Sleep',
    rating: 5,
    textAr: 'ممتازة وعجبت جوزي جدًا، وارتاح عليها فعلًا.',
    textEn: 'Excellent, my husband loved it so much and truly slept comfortably with it.',
    gender: 'female',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-cro-2',
    authorNameAr: 'طارق ع.',
    authorNameEn: 'Tarek A.',
    roleOrContextAr: 'الجيزة • الشخير والنوم',
    roleOrContextEn: 'Giza • Snoring & Sleep',
    tagAr: 'الشخير',
    tagEn: 'Snoring',
    rating: 5,
    textAr: 'حسيت إن الشخير قل عندي، والنوم بقى أريح من الأول.',
    textEn: 'I felt my snoring decreased noticeably, and sleeping became much more comfortable.',
    gender: 'male',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-4',
    authorNameAr: 'أحمد ف.',
    authorNameEn: 'Ahmed F.',
    roleOrContextAr: 'المنصورة • التنفس الليلي',
    roleOrContextEn: 'Mansoura • Night Breathing',
    tagAr: 'فرق من أول استخدام',
    tagEn: 'Clear difference',
    rating: 5,
    textAr: 'كنت بصحى ريقي ناشف كل يوم، دلوقتي بنام وبصحى مرتاح جداً.',
    textEn: 'I used to wake up with a dry mouth every day. Now I sleep comfortably all night.',
    gender: 'male',
    categoryGroup: 'sleep',
    sceneType: 'running-night',
  },
  {
    id: 'rev-cro-3',
    authorNameAr: 'محمود ك.',
    authorNameEn: 'Mahmoud K.',
    roleOrContextAr: 'الإسكندرية • التنفس',
    roleOrContextEn: 'Alexandria • Breathing',
    tagAr: 'التنفس',
    tagEn: 'Breathing',
    rating: 5,
    textAr: 'حسيت إن التنفس من الأنف بقى أسهل مع الاستخدام.',
    textEn: 'I felt that nasal breathing became noticeably easier with regular use.',
    gender: 'male',
    categoryGroup: 'breathing',
    sceneType: 'daily-work',
  },
  {
    id: 'rev-1',
    authorNameAr: 'كريم م.',
    authorNameEn: 'Karim M.',
    roleOrContextAr: 'القاهرة • وقت النوم',
    roleOrContextEn: 'Cairo • Night Sleep',
    tagAr: 'نوم هادي من أول ليلة',
    tagEn: 'Quiet sleep from night one',
    rating: 5,
    textAr: 'أثبت بكتير من اللزق العادي، والـ 4 مقاسات خلوني ألاقي مقاسي المظبوط من أول يوم.',
    textEn: 'Much stronger than regular strips. Having 4 sizes helped me find my fit on day one.',
    gender: 'male',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-cro-4',
    authorNameAr: 'هاني ر.',
    authorNameEn: 'Hany R.',
    roleOrContextAr: 'القاهرة • الراحة الليلية',
    roleOrContextEn: 'Cairo • Night Comfort',
    tagAr: 'الراحة',
    tagEn: 'Comfort',
    rating: 5,
    textAr: 'مريحة جدًا في الاستخدام، ومش بتضايقني وأنا نايم.',
    textEn: 'Very comfortable to wear, and it never bothers me while sleeping.',
    gender: 'male',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },

  // =========================================================================
  // PHASE 2: OBJECTION HANDLING — 24H HOLD, SWEAT RESISTANCE, 4 SIZES & ZERO PRESSURE
  // =========================================================================
  {
    id: 'rev-2',
    authorNameAr: 'عمر ش.',
    authorNameEn: 'Omar S.',
    roleOrContextAr: 'الإسكندرية • الجيم',
    roleOrContextEn: 'Alexandria • Gym',
    tagAr: 'ثابت جداً مع العرق',
    tagEn: 'Holds strong with sweat',
    rating: 5,
    textAr: 'في التمرين مبيتحركش حتى مع العرق، وسحب النفس بقى أسهل بفرق واضح.',
    textEn: 'Does not move during workouts even with sweat. Breathing is much easier.',
    gender: 'male',
    categoryGroup: 'sport',
    sceneType: 'gym-workout',
  },
  {
    id: 'rev-cro-8',
    authorNameAr: 'مصطفى س.',
    authorNameEn: 'Mostafa S.',
    roleOrContextAr: 'المعادي • الثبات',
    roleOrContextEn: 'Maadi • Stability',
    tagAr: 'الثبات',
    tagEn: 'Stability',
    rating: 5,
    textAr: 'لما اخترت المقاس المناسب، حسيت إنها ثابتة ومريحة أكتر.',
    textEn: 'Once I picked the right size, I felt it held firmly and comfortably.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'pro-recovery',
  },
  {
    id: 'rev-3',
    authorNameAr: 'مريم أ.',
    authorNameEn: 'Mariam A.',
    roleOrContextAr: 'الجيزة • رياضة البادل',
    roleOrContextEn: 'Giza • Padel',
    tagAr: 'خفيف ومش محسوس',
    tagEn: 'Light and comfortable',
    rating: 5,
    textAr: 'أداة التثبيت خلت تركيبه سهل أوي، والمشبك خفيف ومش بيضغط على الأنف.',
    textEn: 'The applicator makes it super easy to put on, and the clip feels very light.',
    gender: 'female',
    categoryGroup: 'sport',
    sceneType: 'padel-court',
  },
  {
    id: 'rev-cro-5',
    authorNameAr: 'شريف ن.',
    authorNameEn: 'Sherif N.',
    roleOrContextAr: 'مدينة نصر • التركيب',
    roleOrContextEn: 'Nasr City • Easy Setup',
    tagAr: 'التركيب',
    tagEn: 'Setup',
    rating: 5,
    textAr: 'سهلة في التركيب والاستخدام، ومش محتاجة وقت عشان أفهمها.',
    textEn: 'Easy to apply and use, and took no time at all to figure out.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'daily-work',
  },
  {
    id: 'rev-cro-11',
    authorNameAr: 'وليد ج.',
    authorNameEn: 'Walid G.',
    roleOrContextAr: 'التجمع • المقاسات',
    roleOrContextEn: 'New Cairo • Sizing',
    tagAr: 'المقاس',
    tagEn: 'Sizing',
    rating: 5,
    textAr: 'وجود أكتر من مقاس ميزة كويسة عشان الواحد يختار الأنسب.',
    textEn: 'Having multiple sizes included is a great advantage to pick the best fit.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'pro-recovery',
  },
  {
    id: 'rev-cro-20',
    authorNameAr: 'رامي د.',
    authorNameEn: 'Ramy D.',
    roleOrContextAr: 'الشيخ زايد • التنفس',
    roleOrContextEn: 'Sheikh Zayed • Breathing',
    tagAr: 'التنفس',
    tagEn: 'Breathing',
    rating: 5,
    textAr: 'بالنسبة لي، حسيت إن مرور الهوا من الأنف بقى أسهل.',
    textEn: 'For me, I felt airflow through my nose became much smoother.',
    gender: 'male',
    categoryGroup: 'breathing',
    sceneType: 'running-night',
  },

  // =========================================================================
  // PHASE 3: GYM, RUNNING, REALISTIC CREDIBILITY & DAILY ROUTINE INTEGRATION
  // =========================================================================
  {
    id: 'rev-cro-6',
    authorNameAr: 'سيف ب.',
    authorNameEn: 'Seif B.',
    roleOrContextAr: 'سموحة • الجيم',
    roleOrContextEn: 'Smouha • Gym',
    tagAr: 'الجيم',
    tagEn: 'Gym',
    rating: 5,
    textAr: 'خفيفة وسهلة الاستخدام، وبالنسبة لي مناسبة وقت التمرين.',
    textEn: 'Lightweight and easy to use, and works great for me during workouts.',
    gender: 'male',
    categoryGroup: 'sport',
    sceneType: 'gym-workout',
  },
  {
    id: 'rev-cro-13',
    authorNameAr: 'تامر ف.',
    authorNameEn: 'Tamer F.',
    roleOrContextAr: 'مصر الجديدة • النوم',
    roleOrContextEn: 'Heliopolis • Sleep',
    tagAr: 'الشخير',
    tagEn: 'Snoring',
    rating: 5,
    textAr: 'لاحظت فرق في تجربتي مع النوم، بس النتيجة بتختلف من شخص للتاني.',
    textEn: 'I noticed a difference in my sleep experience, though results vary from person to person.',
    gender: 'male',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-cro-18',
    authorNameAr: 'باسل م.',
    authorNameEn: 'Basel M.',
    roleOrContextAr: 'القاهرة • القيمة مقابل السعر',
    roleOrContextEn: 'Cairo • Value',
    tagAr: 'القيمة',
    tagEn: 'Value',
    rating: 5,
    textAr: 'فكرة المنتج عملية، ووجود المكونات مع بعض حاجة كويسة.',
    textEn: 'The product concept is very practical, and having all components together is great.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'daily-work',
  },
  {
    id: 'rev-cro-12',
    authorNameAr: 'نادر ح.',
    authorNameEn: 'Nader H.',
    roleOrContextAr: 'المهندسين • الجودة',
    roleOrContextEn: 'Mohandessin • Quality',
    tagAr: 'الجودة',
    tagEn: 'Quality',
    rating: 5,
    textAr: 'الخامات شكلها كويس، وطريقة الاستخدام بسيطة وواضحة.',
    textEn: 'The materials look well-made, and how to use it is simple and clear.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'pro-recovery',
  },
  {
    id: 'rev-cro-7',
    authorNameAr: 'زياد ط.',
    authorNameEn: 'Ziad T.',
    roleOrContextAr: 'القاهرة • الجري',
    roleOrContextEn: 'Cairo • Running',
    tagAr: 'الجري',
    tagEn: 'Running',
    rating: 5,
    textAr: 'حجمها صغير وسهل آخدها معايا وأنا خارج أجري.',
    textEn: 'Compact size and super easy to take with me when heading out for a run.',
    gender: 'male',
    categoryGroup: 'sport',
    sceneType: 'running-night',
  },
  {
    id: 'rev-cro-14',
    authorNameAr: 'نهى ع.',
    authorNameEn: 'Noha A.',
    roleOrContextAr: 'أكتوبر • روتين النوم',
    roleOrContextEn: 'October • Sleep Routine',
    tagAr: 'الراحة',
    tagEn: 'Comfort',
    rating: 5,
    textAr: 'مريحة بالنسبة لي، وسهل أستخدمها ضمن روتين النوم.',
    textEn: 'Comfortable for me, and easy to include in my nightly sleep routine.',
    gender: 'female',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-cro-10',
    authorNameAr: 'حازم ص.',
    authorNameEn: 'Hazem S.',
    roleOrContextAr: 'طنطا • التنفس المريح',
    roleOrContextEn: 'Tanta • Easy Breathing',
    tagAr: 'التنفس',
    tagEn: 'Breathing',
    rating: 5,
    textAr: 'كنت بدور على حاجة تساعدني أتنفس من الأنف براحة أكتر.',
    textEn: 'I was looking for something to help me breathe through my nose more comfortably.',
    gender: 'male',
    categoryGroup: 'breathing',
    sceneType: 'daily-work',
  },

  // =========================================================================
  // PHASE 4: EASE OF ROUTINE, PORTABILITY & CLOSING BUNDLE / DELIVERY PROOF
  // =========================================================================
  {
    id: 'rev-cro-15',
    authorNameAr: 'أيمن و.',
    authorNameEn: 'Ayman W.',
    roleOrContextAr: 'الزمالك • الاستخدام اليومي',
    roleOrContextEn: 'Zamalek • Daily Use',
    tagAr: 'الاستخدام',
    tagEn: 'Usability',
    rating: 5,
    textAr: 'طريقة استخدامها بسيطة، وبعد ما فهمت التعليمات بقيت أسهل.',
    textEn: 'Simple to use, and once I read the instructions it became even easier.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'daily-work',
  },
  {
    id: 'rev-cro-16',
    authorNameAr: 'مروان ل.',
    authorNameEn: 'Marwan L.',
    roleOrContextAr: 'الإسكندرية • الرياضة',
    roleOrContextEn: 'Alexandria • Sports',
    tagAr: 'الرياضة',
    tagEn: 'Sports',
    rating: 5,
    textAr: 'خفيفة ومش بتاخد مساحة، وسهل أحطها مع حاجات التمرين.',
    textEn: 'Light and takes zero space, easy to pack in my workout bag.',
    gender: 'male',
    categoryGroup: 'sport',
    sceneType: 'gym-workout',
  },
  {
    id: 'rev-cro-19',
    authorNameAr: 'دينا ش.',
    authorNameEn: 'Dina S.',
    roleOrContextAr: 'القاهرة • قبل النوم',
    roleOrContextEn: 'Cairo • Pre-Sleep',
    tagAr: 'النوم',
    tagEn: 'Sleep',
    rating: 5,
    textAr: 'جربتها قبل النوم، وكانت مريحة بالنسبة لي أثناء الاستخدام.',
    textEn: 'Tried it before sleep, and it felt comfortable throughout use.',
    gender: 'female',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-cro-17',
    authorNameAr: 'حسام ق.',
    authorNameEn: 'Hossam Q.',
    roleOrContextAr: 'الإسماعيلية • التجربة',
    roleOrContextEn: 'Ismailia • Experience',
    tagAr: 'التجربة',
    tagEn: 'Experience',
    rating: 5,
    textAr: 'تجربتي معاها كويسة، وأكتر حاجة عجبتني سهولة استخدامها.',
    textEn: 'My experience with it is great, and what I liked most is how easy it is to use.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'pro-recovery',
  },
  {
    id: 'rev-cro-9',
    authorNameAr: 'مازن ي.',
    authorNameEn: 'Mazen Y.',
    roleOrContextAr: 'المنصورة • النوم',
    roleOrContextEn: 'Mansoura • Sleep',
    tagAr: 'النوم',
    tagEn: 'Sleep',
    rating: 5,
    textAr: 'استخدامها قبل النوم سهل، وتجربتي معاها كانت كويسة.',
    textEn: 'Using it before bed is simple, and my experience with it was really good.',
    gender: 'male',
    categoryGroup: 'sleep',
    sceneType: 'deep-sleep',
  },
  {
    id: 'rev-6',
    authorNameAr: 'خالد ن.',
    authorNameEn: 'Khaled N.',
    roleOrContextAr: 'طنطا • السفر والنوم',
    roleOrContextEn: 'Tanta • Travel & Sleep',
    tagAr: 'عملي جداً',
    tagEn: 'Very practical',
    rating: 5,
    textAr: 'علبته صغيرة وشيك، وفكرة المغناطيس أقوى بكتير من أي شريط عادي.',
    textEn: 'Compact box for travel, and the magnetic pull works way better than regular tape.',
    gender: 'male',
    categoryGroup: 'setup',
    sceneType: 'daily-work',
  },
  {
    id: 'rev-5',
    authorNameAr: 'يوسف ح.',
    authorNameEn: 'Youssef H.',
    roleOrContextAr: 'القاهرة • الجري',
    roleOrContextEn: 'Cairo • Running',
    tagAr: 'توصيل سريع وخامة ممتازة',
    tagEn: 'Fast delivery & great quality',
    rating: 5,
    textAr: 'طلبت عرض العبوتين ووصلني في أقل من 48 ساعة. خامة ممتازة وثبات 24 ساعة بجد.',
    textEn: 'Ordered the 2-pack and got it in under 48 hours. Great quality and real 24h hold.',
    gender: 'male',
    categoryGroup: 'sport',
    sceneType: 'pro-recovery',
  },
];

export const MISSING_INPUTS_REGISTRY: MissingInputRecord[] = [
  {
    key: 'PRODUCT_IDENTITY_AND_COPY',
    labelAr: 'هوية المنتج والنصوص الثنائية (العربية والإنجليزية)',
    currentFallbackBehaviorAr: 'مؤكد بنصوص بسيطة وواضحة باللغتين',
    status: 'CONFIRMED_FROM_REFERENCE',
  },
];
