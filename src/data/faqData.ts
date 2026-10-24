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
        questionAr: 'كام مصاريف الشحن؟ وإمتى يكون مجاني؟',
        questionEn: 'How much is shipping? When is it free?',
        answerAr:
          'الشحن مجاني تماماً لأي طلب يتخطى 500 ج.م (زي عرض العبوتين أو الـ 3 عبوات). وللطلبات الأقل: 85 ج.م للقاهرة و95 ج.م للمحافظات.',
        answerEn:
          'Shipping is 100% FREE on orders over 500 EGP (2-Pack or 3-Pack). Below 500 EGP: 85 EGP for Cairo and 95 EGP for other governorates.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'سياسة الشحن',
      },
      {
        id: 'faq-delivery-duration',
        questionAr: 'الطلب بيوصل في قد إيه؟',
        questionEn: 'How fast is delivery?',
        answerAr:
          'بيكون قدام بيتك خلال 48 ساعة، والدفع كاش عند الاستلام.',
        answerEn:
          'Your order arrives at your door within 48 hours with Cash on Delivery.',
        verificationStatus: 'VERIFIED',
        sourceNoteAr: 'توصيل 48 ساعة',
      },
    ],
  },
];
