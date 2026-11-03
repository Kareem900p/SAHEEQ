export interface FAQItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  verificationStatus: 'VERIFIED' | 'FAQ_NEEDS_VERIFICATION';
  sourceNoteAr: string;
}

export interface FAQCategoryGroup {
  id: string;
  categoryTitleAr: string;
  categoryTitleEn: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategoryGroup[] = [
  {
    id: 'box-contents-and-mechanism',
    categoryTitleAr: 'عن المنتج وطريقة الاستخدام',
    categoryTitleEn: 'Product & How to Use',
    items: [
      {
        id: 'faq-what-is-in-box',
        questionAr: 'إيه اللي جوه العبوة الواحدة؟',
        questionEn: 'What is inside one pack?',
        answerAr:
          'كل عبوة فيها: 30 لاصقة مغناطيسية (تكفي 30 يوم كاملين)، 4 مقاسات مشابك أنفية (صغير، متوسط، كبير، XL)، وأداة تثبيت مغناطيسية.',
        answerEn:
          'Each pack includes: 30 magnetic adhesive tabs (for 30 full days), 4 reusable clip sizes (S, M, L, XL), and 1 magnetic applicator tool.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'مكونات العبوة',
      },
      {
        id: 'faq-how-it-works',
        questionAr: 'إيه الفرق بينه وبين اللزق العادي؟',
        questionEn: 'How is it better than regular nose strips?',
        answerAr:
          'اللزق العادي بيفك مع العرق أو النوم. شهيق بيفتح الأنف بمشبك خارجي مغناطيسي ثابت 24 ساعة ومريح جداً على البشرة.',
        answerEn:
          'Regular strips peel off with sweat. SHAHEEQ uses an external magnetic clip that holds gently and firmly for up to 24 hours.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'آلية العمل',
      },
      {
        id: 'faq-sizes-fit',
        questionAr: 'محتاج أختار مقاس قبل الطلب؟',
        questionEn: 'Do I need to pick a size before buying?',
        answerAr:
          'لأ، الـ 4 مقاسات كلها موجودة جوه نفس العلبة عشان تجرب وتلبس المقاس المريح لأنفك.',
        answerEn:
          'No. All 4 clip sizes come inside every box so you can try them and use the one that fits you best.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'شمول 4 مقاسات',
      },
    ],
  },
  {
    id: 'pricing-shipping-and-orders',
    categoryTitleAr: 'الأسعار والشحن السريع',
    categoryTitleEn: 'Prices & Fast Shipping',
    items: [
      {
        id: 'faq-price-and-shipping',
        questionAr: 'كام مصاريف الشحن؟',
        questionEn: 'How much is shipping?',
        answerAr:
          'مصاريف الشحن 85 ج.م للقاهرة و95 ج.م لباقي المحافظات، مع توصيل سريع في 48 ساعة لحد قدام بيتك.',
        answerEn:
          'Shipping is 85 EGP for Cairo and 95 EGP for other governorates, with fast 48-hour delivery right to your door.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'سياسة الشحن',
      },
      {
        id: 'faq-delivery-duration',
        questionAr: 'الطلب بيوصل في قد إيه؟',
        questionEn: 'How fast is delivery?',
        answerAr:
          'توصيل في 48 ساعة لحد قدام بيتك، والدفع كاش عند الاستلام.',
        answerEn:
          'Delivery in 48 hours right to your door with Cash on Delivery.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'توصيل 48 ساعة',
      },
    ],
  },
];
