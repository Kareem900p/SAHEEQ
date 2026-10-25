import React, { useState } from 'react';
import {
  Share2,
  Check,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Truck,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle2,
  ShoppingBag,
  Magnet,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  calculateSavingsAmount,
  calculateShippingByGovernorate,
  resolvePackQuantityPricing,
  packCountToCartItem,
  type PackageTier,
  type ProductVariant,
  type PurchaseButtonState,
} from '../utils/ecommerceMath';
import {
  normalizePhoneString,
  isValidCustomerPhone,
} from '../utils/orderIntake';
import {
  generateSubmissionId,
  submitOrderToServer,
  type ConfirmedOrderRecord,
} from '../utils/orderClient';
import { trackConversionEvent } from '../utils/analytics';
import type { GallerySlide } from '../data/brandConfig';
import { BundleMiniPreview, GallerySlideVisual } from './ProductVisuals';
import { GovernorateSelect } from './GovernorateSelect';

interface ProductHeroProps {
  currentLanguage?: 'ar' | 'en';
  productCategoryAr?: string;
  productCategoryEn?: string;
  productTitleAr: string;
  productTitleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  shortBenefitHeadlineAr: string;
  shortBenefitHeadlineEn?: string;
  shortBenefitSubheadlineAr?: string;
  shortBenefitSubheadlineEn?: string;
  shortBenefitIntroAr?: string;
  shortBenefitIntroEn?: string;
  shortBenefitBulletsAr: string[];
  shortBenefitBulletsEn?: string[];
  packages: PackageTier[];
  variants: ProductVariant[];
  gallerySlides: GallerySlide[];
  selectedPackageId: string;
  selectedVariantId: string;
  quantity: number;
  activeSlideIndex: number;
  freeShippingThreshold: number;
  standardShippingFee?: number;
  cairoShippingFee?: number;
  otherGovShippingFee?: number;
  fomoRemainingPacks?: number;
  fomoWindowAr?: string;
  fomoWindowEn?: string;
  guaranteeLineAr?: string;
  guaranteeLineEn?: string;
  deliveryEstimateAr: string;
  deliveryEstimateEn?: string;
  buttonState: PurchaseButtonState;
  onSelectPackage: (pkgId: string) => void;
  onSelectVariant: (variantId: string) => void;
  onChangeQuantity: (newQty: number) => void;
  onSelectSlide: (idx: number) => void;
  onAddToCart: () => void;
  onDirectOrderSubmit?: (orderData: {
    orderId: string;
    fullName: string;
    phone: string;
    governorate: string;
    address: string;
    note: string;
    quantity: number;
    totalAmount: number;
  }) => void;
  onOrderConfirmed?: (confirmedOrder: ConfirmedOrderRecord) => void;
  onOpenShippingPolicy: () => void;
  onOpenFullSpecsModal: () => void;
}

const EGYPT_GOVERNORATES: Array<{ ar: string; en: string }> = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'الشرقية', en: 'Sharqia' },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'المنوفية', en: 'Monufia' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'الفيوم', en: 'Faiyum' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'أسيوط', en: 'Assiut' },
  { ar: 'سوهاج', en: 'Sohag' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
];

export const ProductHero: React.FC<ProductHeroProps> = ({
  currentLanguage = 'ar',
  productTitleAr,
  productTitleEn = 'Magnetic Nasal Dilator',
  shortBenefitHeadlineAr,
  shortBenefitHeadlineEn = 'Inside Every Pack:',
  shortBenefitBulletsAr,
  shortBenefitBulletsEn = ['30 Magnetic Tabs', '4 Clip Sizes', 'Quick Applicator'],
  packages,
  variants,
  gallerySlides,
  selectedVariantId,
  quantity,
  activeSlideIndex,
  freeShippingThreshold = 500,
  cairoShippingFee = 85,
  otherGovShippingFee = 95,
  deliveryEstimateAr,
  deliveryEstimateEn = '48h Door Delivery',
  buttonState,
  onSelectPackage,
  onChangeQuantity,
  onSelectSlide,
  onAddToCart,
  onDirectOrderSubmit,
  onOrderConfirmed,
  onOpenShippingPolicy,
  onOpenFullSpecsModal,
}) => {
  const isEn = currentLanguage === 'en';
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Popup Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [directFormError, setDirectFormError] = useState('');
  const [isSubmittingDirectOrder, setIsSubmittingDirectOrder] = useState(false);
  const [directOrderSuccess, setDirectOrderSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [submissionId, setSubmissionId] = useState<string>(() => generateSubmissionId());

  const resolvedPricing = resolvePackQuantityPricing(quantity, packages);
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  const totalSalePrice = resolvedPricing.lineSaleTotal;
  const totalRegularPrice = resolvedPricing.lineRegularTotal;

  const calculatedShippingCost = calculateShippingByGovernorate(
    totalSalePrice,
    governorate || 'القاهرة',
    freeShippingThreshold,
    cairoShippingFee,
    otherGovShippingFee
  );
  const finalOrderTotal = totalSalePrice + calculatedShippingCost;

  const activeSlide = gallerySlides[activeSlideIndex] || gallerySlides[0];
  const currencyLabel = isEn ? 'EGP' : 'ج.م';
  const selectedPkgName = isEn
    ? resolvedPricing.packageNameEn
    : resolvedPricing.packageNameAr;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: isEn ? productTitleEn : productTitleAr,
          text: isEn ? shortBenefitHeadlineEn : shortBenefitHeadlineAr,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleDirectFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingDirectOrder) return;

    if (!fullName.trim() || !phone.trim() || !governorate.trim() || !address.trim()) {
      setDirectFormError(
        isEn
          ? 'Please enter your name, phone, city, and address.'
          : 'اكتب الاسم والموبايل والمحافظة والعنوان.'
      );
      return;
    }

    const normalizedPhone = normalizePhoneString(phone);
    if (!isValidCustomerPhone(normalizedPhone)) {
      setDirectFormError(
        isEn
          ? 'Please enter a valid 11-digit mobile number (e.g. 010xxxxxxxx).'
          : 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم (مثال: 010xxxxxxxx).'
      );
      return;
    }

    setDirectFormError('');
    setIsSubmittingDirectOrder(true);

    const result = await submitOrderToServer({
      submission_id: submissionId,
      checkout_source: 'direct_modal',
      customer_name: fullName.trim(),
      customer_phone: normalizedPhone,
      governorate: governorate.trim(),
      detailed_address: address.trim(),
      delivery_notes: note.trim(),
      customer_notes: note.trim(),
      items: [packCountToCartItem(quantity, selectedVariant.id)],
    });

    setIsSubmittingDirectOrder(false);

    if (!result.ok || !result.orderId) {
      setDirectFormError(
        isEn
          ? result.messageEn || 'Could not confirm your order. Please try again.'
          : result.messageAr || 'تعذر تسجيل الطلب حالياً. يرجى المحاولة مرة أخرى.'
      );
      return;
    }

    setConfirmedOrderId(result.orderId);
    setDirectOrderSuccess(true);
    // Prepare a new submission_id for any future distinct order
    setSubmissionId(generateSubmissionId());

    if (onDirectOrderSubmit) {
      onDirectOrderSubmit({
        orderId: result.orderId,
        fullName: fullName.trim(),
        phone: normalizedPhone,
        governorate: governorate.trim(),
        address: address.trim(),
        note: note.trim(),
        quantity,
        totalAmount: result.computedTotals?.customer_total ?? finalOrderTotal,
      });
    }

    if (onOrderConfirmed && result.confirmedOrder) {
      setIsCheckoutModalOpen(false);
      onOrderConfirmed(result.confirmedOrder);
    }
  };

  const isButtonDisabled =
    buttonState === 'OUT_OF_STOCK' ||
    buttonState === 'VARIANT_UNAVAILABLE' ||
    buttonState === 'ADDING_TO_CART';

  const activePills = isEn ? shortBenefitBulletsEn : shortBenefitBulletsAr;

  return (
    <section
      id="product-hero"
      aria-label={isEn ? 'Product Details and Bundles' : 'تفاصيل المنتج والشراء'}
      className="w-full py-6 sm:py-10 lg:py-12"
    >
      <div className="layout-container">
        <div
          dir="ltr"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start"
        >
          {/* GALLERY COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full mx-auto lg:mx-0 lg:sticky lg:top-24"
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#021E26] shadow-xl group border border-white/12">
              <GallerySlideVisual
                slide={activeSlide}
                variantId={selectedVariant.id}
                isThumbnail={false}
              />

              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label={isEn ? 'Zoom product image' : 'تكبير صورة المنتج'}
                className="absolute bottom-4 left-4 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#01181E]/90 text-[#F4F3EF] hover:bg-[#01181E] hover:text-[#CEF90B] border border-white/20 flex items-center justify-center transition-all opacity-95 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer z-20 shadow-md"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* 6 Thumbnails Row (>= 44px touch target) */}
            <div
              role="tablist"
              aria-label={isEn ? 'Product gallery thumbnails' : 'صور المنتج المصغرة'}
              className="grid grid-cols-6 gap-2 sm:gap-2.5 mt-3"
            >
              {gallerySlides.map((slide, idx) => {
                const isSelected = idx === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`View image ${idx + 1}: ${isEn ? slide.titleEn : slide.titleAr}`}
                    onClick={() => onSelectSlide(idx)}
                    className={`relative aspect-square min-h-[44px] min-w-[44px] rounded-xl overflow-hidden transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CEF90B] ${
                      isSelected
                        ? 'ring-2 ring-[#CEF90B] scale-[1.02] opacity-100'
                        : 'ring-1 ring-white/15 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <GallerySlideVisual
                      slide={slide}
                      variantId={selectedVariant.id}
                      isThumbnail={true}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* BUY BOX COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            dir={isEn ? 'ltr' : 'rtl'}
            className={`lg:col-span-6 w-full flex flex-col gap-4 ${
              isEn ? 'text-left' : 'text-right'
            }`}
          >
            {/* BLOCK 1: Balanced Header Row (Product Title + V2 Indicator + Clean Price) & 1-Line Value Hook */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                {/* Product H1 + V2 Second Edition Label */}
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <h1 className="type-h1 font-extrabold text-[#F4F3EF] leading-tight">
                    {isEn ? productTitleEn : productTitleAr}
                  </h1>
                  <span
                    data-testid="product-v2-edition-badge"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#DDFE01]/15 border border-[#DDFE01]/45 text-[#DDFE01] type-xs font-extrabold whitespace-nowrap"
                  >
                    <span className="px-1.5 py-0.2 rounded bg-[#DDFE01] text-[#01181E] font-extrabold">
                      V2
                    </span>
                    <span>
                      {isEn
                        ? '2nd Edition • Zero Issues'
                        : 'الإصدار الثاني بدون أي مشاكل'}
                    </span>
                  </span>
                </div>

                {/* Clean Price Only (Sale Price + Strikethrough Regular Price, Zero Badges) */}
                <div
                  role="status"
                  aria-live="polite"
                  className="inline-flex flex-col sm:flex-row sm:items-baseline items-end gap-1 sm:gap-2 shrink-0 pt-1"
                >
                  <span
                    data-testid="hero-sale-price"
                    className="text-2xl sm:text-3xl font-extrabold text-[#CEF90B] tabular-nums leading-none"
                  >
                    {totalSalePrice} {currencyLabel}
                  </span>

                  {totalRegularPrice > totalSalePrice && (
                    <span className="type-sm text-[#C2CFD4]/75 line-through font-bold tabular-nums leading-none">
                      {totalRegularPrice} {currencyLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Single Clean Value Line (16-18px Body) */}
              <p className="type-body text-[#C2CFD4] font-medium">
                {isEn
                  ? 'Opens your nose gently for deep sleep and peak workouts — 100% drug-free.'
                  : 'نَفَس مفتوح من أول ثانية لنوم أعمق وتمرين أقوى — بدون شخير أو أدوية.'}
              </p>
            </div>

            {/* BLOCK 2: 3 Minimal Bundle Cards (2-Pack = Best Offer + Free Shipping over 500 EGP) */}
            <div
              className="pt-4 border-t border-white/12"
              role="radiogroup"
              aria-label={isEn ? 'Choose bundle' : 'اختر العرض'}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="type-sm font-extrabold text-[#F4F3EF]">
                  {isEn ? 'Select Your Offer' : 'اختار عرضك'}
                </span>
                <span className="type-xs font-extrabold text-[#CEF90B]">
                  {isEn
                    ? `Free shipping over ${freeShippingThreshold} EGP`
                    : `شحن مجاني فوق ${freeShippingThreshold} ج.م`}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {packages.map((pkg) => {
                  const isSelected = pkg.packsCount === quantity;
                  const pkgSavings = calculateSavingsAmount(
                    pkg.regularPrice,
                    pkg.salePrice,
                    1
                  );
                  const qualifiesFreeShipping = pkg.salePrice >= freeShippingThreshold;
                  const badgeLabel = isEn ? pkg.badgeTextEn : pkg.badgeTextAr;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => onSelectPackage(pkg.id)}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectPackage(pkg.id);
                        }
                      }}
                      data-testid={`bundle-card-${pkg.id}`}
                      className={`w-full min-h-[76px] rounded-xl overflow-hidden transition-all cursor-pointer select-none border flex items-center ${
                        isSelected
                          ? 'bg-[#F8F8F8] text-[#121212] border-[#CEF90B] ring-2 ring-[#CEF90B] shadow-md'
                          : pkg.isBestValue
                          ? 'bg-[#032630] text-[#F4F3EF] border-[#CEF90B]/60 hover:border-[#CEF90B]'
                          : 'bg-[#021E26] text-[#F4F3EF] border-white/15 hover:border-white/40'
                      }`}
                    >
                      <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <BundleMiniPreview
                            packsCount={pkg.packsCount}
                            variantId={selectedVariant.id}
                          />
                          <div className="flex flex-col items-start min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`type-body font-extrabold ${
                                  isSelected ? 'text-[#070707]' : 'text-[#F4F3EF]'
                                }`}
                              >
                                {isEn ? pkg.nameEn : pkg.nameAr}
                              </span>

                              {badgeLabel && (
                                <span
                                  className={`type-xs font-extrabold px-2.5 py-0.5 rounded-lg ${
                                    pkg.isBestValue
                                      ? isSelected
                                        ? 'bg-[#01181E] text-[#DDFE01]'
                                        : 'bg-[#DDFE01] text-[#01181E]'
                                      : isSelected
                                      ? 'bg-[#01181E]/12 text-[#01181E]'
                                      : 'bg-white/12 text-[#CEF90B]'
                                  }`}
                                >
                                  {badgeLabel}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className={`type-xs font-bold tabular-nums ${
                                  isSelected ? 'text-[#121212]/80' : 'text-[#C2CFD4]'
                                }`}
                              >
                                {isEn
                                  ? `Save ${pkgSavings} EGP`
                                  : `وفّر ${pkgSavings} ج.م`}
                              </span>

                              {qualifiesFreeShipping && (
                                <span
                                  className={`type-xs font-extrabold inline-flex items-center gap-1 ${
                                    isSelected ? 'text-[#085431]' : 'text-[#CEF90B]'
                                  }`}
                                >
                                  • {isEn ? 'Free Shipping' : 'شحن مجاني'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end text-left shrink-0" dir="ltr">
                          <span
                            className={`text-lg sm:text-xl font-extrabold tabular-nums ${
                              isSelected ? 'text-[#070707]' : 'text-[#CEF90B]'
                            }`}
                          >
                            {pkg.salePrice} {currencyLabel}
                          </span>
                          {pkg.regularPrice > pkg.salePrice && (
                            <span
                              className={`type-xs line-through font-bold tabular-nums ${
                                isSelected ? 'text-[#C84B31]' : 'text-[#C2CFD4]/75'
                              }`}
                            >
                              {pkg.regularPrice} {currencyLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BLOCK 3: Persuasive 24-Hour Magnetic Guarantee + Fast Shipping Grid */}
            <div
              data-testid="hero-guarantee-banner"
              className="rounded-xl bg-[#03232B] border border-[#CEF90B]/30 p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CEF90B]/15 border border-[#CEF90B]/35 flex items-center justify-center shrink-0 text-[#CEF90B]">
                  <Magnet className="w-5 h-5 animate-magnetic-snap" />
                </div>
                <div className="min-w-0">
                  <div className="type-sm font-extrabold text-[#CEF90B]">
                    {isEn
                      ? '24-Hour Magnetic Hold Guarantee (Full 30 Days)'
                      : 'ضمان ثبات المغناطيس 24 ساعة (30 يوم فعلي)'}
                  </div>
                  <p className="type-xs text-[#C2CFD4] mt-1">
                    {isEn
                      ? 'Strong magnetic attraction holds through sleep & sweat — if it slips, we replace it.'
                      : 'قوة جذب مغناطيسية ثابتة طول الليل والتمرين = 30 يوم استخدام كامل للعبوة بدون ما يفك.'}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-2.5 flex items-center justify-between gap-2 type-xs text-[#F4F3EF]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#CEF90B] shrink-0 animate-truck-glide" />
                  <span className="font-bold">
                    {isEn
                      ? `48h Door Delivery • Free over ${freeShippingThreshold} EGP`
                      : `توصيل 48 ساعة لباب البيت • مجاني فوق ${freeShippingThreshold} ج.م`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenShippingPolicy}
                  className="min-h-[44px] px-2 inline-flex items-center text-[#CEF90B] underline underline-offset-4 font-bold shrink-0 cursor-pointer"
                >
                  {isEn ? 'Details' : 'التفاصيل'}
                </button>
              </div>
            </div>

            {/* BLOCK 4: Primary Action Buttons (Order Now Modal + Add to Cart, >= 48px height) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDirectOrderSuccess(false);
                  setIsCheckoutModalOpen(true);
                  trackConversionEvent('begin_checkout', {
                    packageId: resolvedPricing.packageId,
                    value: totalSalePrice,
                    quantity,
                  });
                }}
                disabled={isButtonDisabled}
                data-testid="open-checkout-modal-btn"
                className="min-h-[52px] flex-1 rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-btn font-extrabold px-6 flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(221,254,1,0.22)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <ClipboardCheck className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>
                  {isEn
                    ? `Order Now • ${totalSalePrice} EGP`
                    : `اطلب الآن • ${totalSalePrice} ج.م`}
                </span>
              </button>

              <button
                type="button"
                onClick={onAddToCart}
                disabled={isButtonDisabled}
                data-testid="primary-add-to-cart"
                aria-label={isEn ? 'Add to Cart' : 'أضف للسلة'}
                className="min-h-[52px] px-6 rounded-full border-2 border-[#DDFE01] text-[#DDFE01] hover:bg-[#DDFE01]/10 type-btn font-extrabold flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer"
              >
                {buttonState === 'ADDING_TO_CART' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : buttonState === 'ADDED_TO_CART' ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                <span>
                  {buttonState === 'ADDED_TO_CART'
                    ? isEn
                      ? 'Added'
                      : 'تمت الإضافة'
                    : isEn
                    ? 'Add to Cart'
                    : 'أضف للسلة'}
                </span>
              </button>
            </div>

            {/* BLOCK 5: Minimal Box Contents Chips + Share Row */}
            <div className="pt-4 border-t border-white/12 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-xs font-extrabold text-[#CEF90B] me-1">
                  {isEn ? shortBenefitHeadlineEn : shortBenefitHeadlineAr}
                </span>
                {activePills.map((pill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#021E26] border border-white/12 type-xs font-bold text-[#F4F3EF]"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 type-xs text-[#C2CFD4]">
                <span className="inline-flex items-center gap-1.5 font-semibold min-h-[44px]">
                  <ShieldCheck className="w-4 h-4 text-[#CEF90B]" />
                  <span>{isEn ? 'Cash on Delivery' : 'الدفع عند الاستلام'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenFullSpecsModal}
                    className="min-h-[44px] px-2 text-[#CEF90B] hover:underline underline-offset-4 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEn ? 'Kit Details' : 'مكونات العبوة'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="min-h-[44px] px-2 inline-flex items-center gap-1.5 text-[#F4F3EF] hover:text-[#CEF90B] transition-colors font-semibold cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>
                      {copiedShare
                        ? isEn
                          ? 'Copied!'
                          : 'تم النسخ!'
                        : isEn
                        ? 'Share'
                        : 'مشاركة'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* DEDICATED POPUP CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? 'Direct Order Checkout' : 'نموذج إتمام الطلب المباشر'}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          dir={isEn ? 'ltr' : 'rtl'}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-[#021E26] border border-[#CEF90B]/35 text-[#F4F3EF] shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#01181E] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-5 h-5 text-[#CEF90B]" />
                <div>
                  <h2 className="type-h3 font-extrabold text-[#F4F3EF]">
                    {isEn ? 'Cash on Delivery' : 'إتمام الطلب — الدفع عند الاستلام'}
                  </h2>
                  <p className="type-xs text-[#CEF90B] font-bold">
                    {isEn
                      ? `Fast delivery: ${deliveryEstimateEn}`
                      : `توصيل سريع: ${deliveryEstimateAr}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                aria-label={isEn ? 'Close checkout' : 'إغلاق نموذج الطلب'}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#C2CFD4] hover:text-[#CEF90B] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {directOrderSuccess ? (
                <div
                  role="status"
                  data-testid="direct-order-confirmation"
                  className="py-6 px-4 text-center space-y-3 bg-[#01181E] rounded-xl border border-[#CEF90B]/40"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#CEF90B] mx-auto" />
                  <h3 className="type-h3 font-extrabold text-[#CEF90B]">
                    {isEn ? 'Order Recorded Successfully!' : 'تم تسجيل طلبك بنجاح!'}
                  </h3>
                  {confirmedOrderId && (
                    <div
                      data-testid="confirmed-order-id"
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#CEF90B]/15 border border-[#CEF90B]/35 text-[#CEF90B] type-xs font-extrabold tabular-nums"
                    >
                      <span>{isEn ? 'Order ID:' : 'رقم الطلب:'}</span>
                      <span>{confirmedOrderId}</span>
                    </div>
                  )}
                  <p className="type-sm text-[#F4F3EF] leading-relaxed">
                    {isEn ? (
                      <>
                        Thank you <strong>{fullName}</strong> ({governorate}). Your order (
                        {selectedPkgName}) has been recorded and will be prepared for delivery •
                        Total on delivery:{' '}
                        <strong className="text-[#CEF90B] tabular-nums">
                          {finalOrderTotal} EGP
                        </strong>
                        .
                      </>
                    ) : (
                      <>
                        شكراً يا <strong>{fullName}</strong> ({governorate}). تم استلام وتسجيل
                        طلبك ({selectedPkgName}) وسيتم تجهيزه للتوصيل • الإجمالي عند
                        الاستلام:{' '}
                        <strong className="text-[#CEF90B] tabular-nums">
                          {finalOrderTotal} ج.م
                        </strong>
                        .
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="mt-2 min-h-[48px] px-6 rounded-full bg-[#DDFE01] text-[#01181E] type-sm font-extrabold cursor-pointer"
                  >
                    {isEn ? 'Back to Store' : 'العودة للصفحة'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDirectFormSubmit} className="space-y-4" noValidate>
                  {/* Unified Product (30-Piece Pack) + Quantity Stepper (+1 / -1) */}
                  <div
                    data-testid="unified-checkout-product-box"
                    className="p-4 rounded-xl bg-[#01181E] border border-[#CEF90B]/35 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="type-sm font-extrabold text-[#F4F3EF]">
                            {isEn
                              ? 'SHAHEEQ V2 — 30-Piece Pack'
                              : 'عبوة شهيق V2 (30 قطعة)'}
                          </span>
                          <span
                            data-testid="checkout-active-tier-badge"
                            className="px-2 py-0.5 rounded-md bg-[#CEF90B]/15 border border-[#CEF90B]/40 text-[#CEF90B] type-xs font-extrabold"
                          >
                            {selectedPkgName}
                          </span>
                        </div>
                        <div className="type-xs text-[#C2CFD4]">
                          {isEn
                            ? `Total: ${resolvedPricing.totalStrips} magnetic tabs + ${quantity * 4} clips + ${quantity} tool`
                            : `إجمالي ${resolvedPricing.totalStrips} لاصقة مغناطيسية + المشابك والأداة`}
                        </div>
                      </div>

                      {/* Stepper (- / qty / +) */}
                      <div className="flex items-center gap-1 bg-[#03232B] px-1.5 py-1 rounded-full border border-[#CEF90B]/30 shrink-0">
                        <button
                          type="button"
                          data-testid="checkout-qty-minus"
                          onClick={() => {
                            onChangeQuantity(Math.max(1, quantity - 1));
                            setSubmissionId(generateSubmissionId());
                          }}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] type-body font-extrabold text-[#CEF90B] hover:bg-white/5 rounded-full flex items-center justify-center cursor-pointer"
                          aria-label={isEn ? 'Decrease quantity' : 'تقليل الكمية'}
                        >
                          −
                        </button>
                        <span
                          data-testid="checkout-qty-value"
                          className="type-body font-extrabold text-[#F4F3EF] tabular-nums px-2.5"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          data-testid="checkout-qty-plus"
                          onClick={() => {
                            onChangeQuantity(quantity + 1);
                            setSubmissionId(generateSubmissionId());
                          }}
                          className="w-11 h-11 min-w-[44px] min-h-[44px] type-body font-extrabold text-[#CEF90B] hover:bg-white/5 rounded-full flex items-center justify-center cursor-pointer"
                          aria-label={isEn ? 'Increase quantity' : 'زيادة الكمية'}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Bundle Tier Status Strip inside Unified Box */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 type-xs">
                      <span className="text-[#CEF90B] font-bold">
                        {quantity === 1
                          ? isEn
                            ? 'Add +1 pack to unlock the 2-Pack Best Offer (595 EGP + Free Shipping)'
                            : 'زوّد +1 عبوة وادخل في عرض العبوتين (595 ج.م + شحن مجاني)'
                          : quantity === 2
                          ? isEn
                            ? 'Bundle 2 Active: Best Offer (595 EGP) + Free Shipping!'
                            : 'عرض الباندل 2 مفعل: عبوتين بـ 595 ج.م + شحن مجاني!'
                          : quantity === 3
                          ? isEn
                            ? 'Bundle 3 Active: Max Savings (820 EGP) + Free Shipping!'
                            : 'عرض الباندل 3 مفعل: 3 عبوات بـ 820 ج.م + شحن مجاني!'
                          : isEn
                          ? `${quantity} Packs × 320 EGP (Single Pack Price) + Free Shipping`
                          : `${quantity} عبوات × 320 ج.م (سعر العبوة الواحدة) + شحن مجاني`}
                      </span>
                      <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums whitespace-nowrap">
                        <span
                          data-testid="checkout-modal-product-price"
                          className="type-sm font-extrabold text-[#CEF90B]"
                        >
                          {totalSalePrice} {currencyLabel}
                        </span>
                        {totalRegularPrice > totalSalePrice && (
                          <span className="type-xs text-[#C2CFD4]/70 line-through">
                            {totalRegularPrice} {currencyLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="modal-full-name"
                        className="block type-xs font-bold text-[#F4F3EF] mb-1.5"
                      >
                        {isEn ? 'Full Name *' : 'الاسم بالكامل *'}
                      </label>
                      <input
                        id="modal-full-name"
                        name="full_name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isEn ? 'Your full name' : 'اكتب اسمك الثلاثي'}
                        className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-sm text-[#F4F3EF] placeholder:text-[#C2CFD4]/55 focus:border-[#CEF90B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="modal-phone"
                        className="block type-xs font-bold text-[#F4F3EF] mb-1.5"
                      >
                        {isEn ? 'Mobile Number *' : 'رقم الموبايل *'}
                      </label>
                      <input
                        id="modal-phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-sm text-[#F4F3EF] placeholder:text-[#C2CFD4]/55 focus:border-[#CEF90B] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="modal-governorate"
                      className="block type-xs font-bold text-[#F4F3EF] mb-1.5"
                    >
                      {isEn
                        ? `Governorate * (Free over ${freeShippingThreshold} EGP)`
                        : `المحافظة * (مجاني فوق ${freeShippingThreshold} ج.م)`}
                    </label>
                    <GovernorateSelect
                      id="modal-governorate"
                      value={governorate}
                      onChange={(newGov) => setGovernorate(newGov)}
                      isEn={isEn}
                      isFreeShipping={calculatedShippingCost === 0}
                      cairoFee={cairoShippingFee}
                      otherGovFee={otherGovShippingFee}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-address"
                      className="block type-xs font-bold text-[#F4F3EF] mb-1.5"
                    >
                      {isEn ? 'Street Address *' : 'العنوان بالتفصيل *'}
                    </label>
                    <textarea
                      id="modal-address"
                      name="address"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Area, street name, building number, floor'
                          : 'المنطقة، اسم الشارع، رقم العمارة، الدور'
                      }
                      className="w-full p-3 rounded-lg bg-[#01181E] border border-white/20 type-sm text-[#F4F3EF] placeholder:text-[#C2CFD4]/55 focus:border-[#CEF90B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-note"
                      className="block type-xs font-bold text-[#F4F3EF] mb-1.5"
                    >
                      {isEn ? 'Notes (Optional)' : 'ملحوظة (اختياري)'}
                    </label>
                    <input
                      id="modal-note"
                      name="note"
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Extra phone or preferred delivery time'
                          : 'رقم بديل أو ميعاد مناسب للاستلام'
                      }
                      className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-xs text-[#F4F3EF] placeholder:text-[#C2CFD4]/55 focus:border-[#CEF90B] focus:outline-none"
                    />
                  </div>

                  {/* Live Order Summary inside Modal */}
                  <div className="p-4 rounded-xl bg-[#01181E] border border-white/10 space-y-2 type-xs">
                    <div className="flex items-center justify-between text-[#C2CFD4]">
                      <span>
                        {isEn
                          ? `Price (${selectedPkgName}):`
                          : `سعر العرض (${selectedPkgName}):`}
                      </span>
                      <span className="font-bold tabular-nums text-[#F4F3EF]">
                        {totalSalePrice} {currencyLabel}
                      </span>
                    </div>
                    {resolvedPricing.lineSavings > 0 && (
                      <div className="flex items-center justify-between text-[#CEF90B]">
                        <span>{isEn ? 'Discount Saved:' : 'قيمة الخصم والتوفير:'}</span>
                        <span className="font-bold tabular-nums">
                          - {resolvedPricing.lineSavings} {currencyLabel}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[#C2CFD4]">
                      <span>
                        {isEn
                          ? `Shipping (${deliveryEstimateEn}):`
                          : `الشحن (${governorate} • ${deliveryEstimateAr}):`}
                      </span>
                      <span className="font-extrabold text-[#CEF90B]">
                        {calculatedShippingCost === 0
                          ? isEn
                            ? 'Free (0 EGP)'
                            : 'شحن مجاني (0 ج.م)'
                          : `${calculatedShippingCost} ${currencyLabel}`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between type-body font-extrabold text-[#F4F3EF]">
                      <span>{isEn ? 'Total on Delivery:' : 'الإجمالي عند الاستلام:'}</span>
                      <span
                        data-testid="direct-order-total"
                        className="text-[#CEF90B] tabular-nums"
                      >
                        {finalOrderTotal} {currencyLabel}
                      </span>
                    </div>
                  </div>

                  {directFormError && (
                    <div
                      role="alert"
                      className="type-xs text-red-400 font-bold flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{directFormError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingDirectOrder}
                    data-testid="direct-order-submit-btn"
                    className="w-full min-h-[48px] rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-btn font-extrabold transition-transform active:scale-[0.99] shadow-lg cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmittingDirectOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>
                          {isEn ? 'Recording Order...' : 'جاري تسجيل الطلب...'}
                        </span>
                      </>
                    ) : (
                      <span>
                        {isEn
                          ? `Confirm Order • ${finalOrderTotal} EGP`
                          : `تأكيد الطلب الآن • ${finalOrderTotal} ج.م`}
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? 'Fullscreen Image Preview' : 'معاينة الصورة بالحجم الكامل'}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-2xl aspect-square rounded-2xl overflow-hidden bg-[#021E26] shadow-2xl">
            <GallerySlideVisual
              slide={activeSlide}
              variantId={selectedVariant.id}
              isThumbnail={false}
            />

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label={isEn ? 'Close preview' : 'إغلاق المعاينة'}
              className="absolute top-4 right-4 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#01181E] text-white hover:text-[#CEF90B] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectSlide(
                  (activeSlideIndex - 1 + gallerySlides.length) % gallerySlides.length
                )
              }
              aria-label={isEn ? 'Previous image' : 'الصورة السابقة'}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#01181E]/85 text-white hover:text-[#CEF90B] flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => onSelectSlide((activeSlideIndex + 1) % gallerySlides.length)}
              aria-label={isEn ? 'Next image' : 'الصورة التالية'}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#01181E]/85 text-white hover:text-[#CEF90B] flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
