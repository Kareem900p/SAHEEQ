/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBag, Globe } from 'lucide-react';
import {
  INITIAL_BRAND_CONFIG,
  PRODUCT_PACKAGES,
  PRODUCT_VARIANTS,
  GALLERY_SLIDES,
  PRODUCT_BENEFITS,
  ATHLETE_SLIDES,
  CUSTOMER_REVIEWS_DATA,
  type BrandConfigState,
} from './data/brandConfig';
import { FAQ_CATEGORIES } from './data/faqData';
import {
  calculateCartSummary,
  resolvePurchaseButtonState,
  resolvePackQuantityPricing,
  packCountToCartItem,
  type CartItemInput,
  type ProductVariant,
} from './utils/ecommerceMath';
import { trackConversionEvent } from './utils/analytics';
import { AnnouncementBar } from './components/AnnouncementBar';
import { SiteHeader } from './components/SiteHeader';
import { ProductHero } from './components/ProductHero';
import { ProductBenefits } from './components/ProductBenefits';
import { AthleteCarousel } from './components/AthleteCarousel';
import { ComparisonTable } from './components/ComparisonTable';
import { VariantShowcase } from './components/VariantShowcase';
import { CustomerReviews } from './components/CustomerReviews';
import { FAQSection } from './components/FAQSection';
import { SiteFooter } from './components/SiteFooter';
import { CartDrawer, InfoPolicyModal } from './components/CartDrawer';
import { ThankYouPage } from './components/ThankYouPage';
import type { ConfirmedOrderRecord } from './utils/orderClient';

export default function App() {
  // Single Source of Truth State
  const [brandConfig] = useState<BrandConfigState>(INITIAL_BRAND_CONFIG);
  const [variants] = useState<ProductVariant[]>(PRODUCT_VARIANTS);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-1');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('black');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Cart & UI Interaction States
  const [cartItems, setCartItems] = useState<CartItemInput[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<
    'privacy' | 'refund' | 'shipping' | 'contact' | 'specs' | null
  >(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderRecord | null>(() => {
    try {
      const savedOrder = window.sessionStorage.getItem('shaheeq_confirmed_order');
      return savedOrder ? (JSON.parse(savedOrder) as ConfirmedOrderRecord) : null;
    } catch {
      return null;
    }
  });

  // Persistent Bilingual Language State ('ar' RTL | 'en' LTR)
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>(() => {
    try {
      const saved = window.localStorage.getItem('shaheeq_lang');
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const isEn = currentLanguage === 'en';

  // Sync <html lang> and <html dir> + persist choice
  useEffect(() => {
    const dir = isEn ? 'ltr' : 'rtl';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem('shaheeq_lang', currentLanguage);
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [currentLanguage, isEn]);

  useEffect(() => {
    trackConversionEvent('view_item', {
      product: INITIAL_BRAND_CONFIG.productTitleAr,
      packageId: 'pkg-1',
      salePrice: PRODUCT_PACKAGES[0].salePrice,
      regularPrice: PRODUCT_PACKAGES[0].regularPrice,
    });
  }, []);

  const selectedPackage = useMemo(
    () =>
      PRODUCT_PACKAGES.find((p) => p.id === selectedPackageId) ||
      PRODUCT_PACKAGES[0],
    [selectedPackageId]
  );

  const resolvedPackPricing = useMemo(
    () => resolvePackQuantityPricing(quantity, PRODUCT_PACKAGES),
    [quantity]
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || variants[0],
    [variants, selectedVariantId]
  );

  const cartSummary = useMemo(
    () =>
      calculateCartSummary(
        cartItems,
        PRODUCT_PACKAGES,
        variants,
        brandConfig.freeShippingThreshold,
        brandConfig.standardShippingFee
      ),
    [
      cartItems,
      variants,
      brandConfig.freeShippingThreshold,
      brandConfig.standardShippingFee,
    ]
  );

  const buttonState = useMemo(
    () =>
      resolvePurchaseButtonState({
        globalInStock: brandConfig.globalInStock,
        variantInStock: selectedVariant.inStock,
        packageInStock: selectedPackage.inStock,
        requestedQuantity: quantity,
        availableStock: selectedVariant.stockCount,
        isAdding: isAddingToCart,
        isAddedSuccess,
        hasError: false,
      }),
    [
      brandConfig.globalInStock,
      selectedVariant,
      selectedPackage,
      quantity,
      isAddingToCart,
      isAddedSuccess,
    ]
  );

  const handleToggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Handlers
  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = PRODUCT_PACKAGES.find((p) => p.id === pkgId);
    if (pkg) {
      setQuantity(pkg.packsCount);
    }
    trackConversionEvent('select_package', {
      packageId: pkgId,
      salePrice: pkg?.salePrice,
      stripsCount: pkg?.stripsCount,
    });
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setActiveSlideIndex(0);
    trackConversionEvent('select_variant', { variantId });
  };

  const handleChangeQuantity = (newQty: number) => {
    const safeQty = Math.max(1, Math.min(20, newQty));
    setQuantity(safeQty);
    if (safeQty === 1) {
      setSelectedPackageId('pkg-1');
    } else if (safeQty === 2) {
      setSelectedPackageId('pkg-2');
    } else if (safeQty === 3) {
      setSelectedPackageId('pkg-3');
    } else {
      setSelectedPackageId('pkg-1');
    }
    trackConversionEvent('change_quantity', { quantity: safeQty });
  };

  const handleAddToCart = () => {
    if (
      buttonState === 'OUT_OF_STOCK' ||
      buttonState === 'VARIANT_UNAVAILABLE' ||
      isAddingToCart
    ) {
      return;
    }

    setIsAddingToCart(true);
    setTimeout(() => {
      setCartItems((prev) => {
        const currentSummary = calculateCartSummary(
          prev,
          PRODUCT_PACKAGES,
          variants,
          brandConfig.freeShippingThreshold,
          brandConfig.standardShippingFee
        );
        const existingVariantItem = currentSummary.items.find(
          (i) => i.variantId === selectedVariantId
        );
        const currentPacks = existingVariantItem ? existingVariantItem.packsCount : 0;
        const newTotalPacks = Math.min(20, currentPacks + quantity);
        const otherVariants = prev.filter((i) => i.variantId !== selectedVariantId);
        return [...otherVariants, packCountToCartItem(newTotalPacks, selectedVariantId)];
      });

      setIsAddingToCart(false);
      setIsAddedSuccess(true);
      setIsCartOpen(true);

      trackConversionEvent('add_to_cart', {
        packageId: resolvedPackPricing.packageId,
        variantId: selectedVariantId,
        quantity,
        lineTotal: resolvedPackPricing.lineSaleTotal,
      });

      setTimeout(() => setIsAddedSuccess(false), 1800);
    }, 140);
  };

  const handleUpdateCartLine = (
    _packageId: string,
    variantId: string,
    newPackCount: number
  ) => {
    if (newPackCount <= 0) {
      handleRemoveCartLine(_packageId, variantId);
      return;
    }
    const safeCount = Math.min(20, Math.max(1, newPackCount));
    setCartItems((prev) => {
      const otherVariants = prev.filter((item) => item.variantId !== variantId);
      return [...otherVariants, packCountToCartItem(safeCount, variantId)];
    });
  };

  const handleRemoveCartLine = (packageId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.variantId !== variantId)
    );
    trackConversionEvent('remove_from_cart', { packageId, variantId });
  };

  const handleJumpToSection = (sectionId: string) => {
    if (confirmedOrder) {
      setConfirmedOrder(null);
      try {
        window.sessionStorage.removeItem('shaheeq_confirmed_order');
      } catch {
        // Ignore storage errors
      }
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderConfirmed = (orderRecord: ConfirmedOrderRecord) => {
    setConfirmedOrder(orderRecord);
    try {
      window.sessionStorage.setItem(
        'shaheeq_confirmed_order',
        JSON.stringify(orderRecord)
      );
    } catch {
      // Ignore storage errors
    }
    trackConversionEvent('purchase', {
      orderId: orderRecord.orderId,
      value: orderRecord.orderFields.customer_total,
      governorate: orderRecord.orderFields.governorate,
      quantity: orderRecord.orderFields.quantity,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStore = () => {
    setConfirmedOrder(null);
    try {
      window.sessionStorage.removeItem('shaheeq_confirmed_order');
    } catch {
      // Ignore storage errors
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // JSON-LD Structured Data
  const structuredDataJson = useMemo(() => {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${brandConfig.productTitleAr} (${brandConfig.brandNameEn})`,
      description: brandConfig.descriptionAr,
      category: brandConfig.productCategoryAr,
      brand: {
        '@type': 'Brand',
        name: brandConfig.brandNameEn,
      },
      sku: `SHAHEEQ-MAGNETIC-DILATOR-${selectedPackage.stripsCount}`,
      offers: {
        '@type': 'Offer',
        priceCurrency: brandConfig.currencyCode,
        price: selectedPackage.salePrice.toFixed(2),
        availability:
          brandConfig.globalInStock && selectedVariant.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
        cat.items.map((q) => ({
          '@type': 'Question',
          name: q.questionAr,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answerAr,
          },
        }))
      ),
    };

    return JSON.stringify([productSchema, faqSchema]);
  }, [brandConfig, selectedVariant, selectedPackage]);

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      className="min-h-screen bg-[#01181E] text-[#E8E5E0] flex flex-col overflow-x-hidden"
    >
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />

      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#MainContent"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#DDFE01] focus:text-[#01181E] focus:font-bold"
      >
        {isEn ? 'Skip to main content' : 'انتقل إلى المحتوى الرئيسي'}
      </a>

      {/* SECTION 01: Announcement Bar */}
      <AnnouncementBar
        freeShippingThreshold={brandConfig.freeShippingThreshold}
        currencySymbolAr={brandConfig.currencySymbolAr}
        currentLanguage={currentLanguage}
        onOpenShippingPolicy={() => setActiveInfoModal('shipping')}
      />

      {/* SECTION 02: Primary Navigation Header */}
      <SiteHeader
        brandNameAr={brandConfig.brandNameAr}
        brandNameEn={brandConfig.brandNameEn}
        logoPath={brandConfig.logoPrimaryPath}
        cartCount={cartSummary.totalQuantity}
        currentLanguage={currentLanguage}
        onToggleLanguage={handleToggleLanguage}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onOpenCart={() => {
          trackConversionEvent('view_cart', {
            itemsCount: cartSummary.totalQuantity,
          });
          setIsCartOpen(true);
        }}
      />

      {/* Main Content */}
      <main id="MainContent" className="flex-1">
        {confirmedOrder ? (
          <ThankYouPage
            order={confirmedOrder}
            currentLanguage={currentLanguage}
            onUpdateConfirmedOrder={handleOrderConfirmed}
            onBackToStore={handleBackToStore}
          />
        ) : (
          <>
            {/* SECTION 03: Product Hero Master Build (Magnetic Nasal Dilator) */}
            <ProductHero
              currentLanguage={currentLanguage}
              productCategoryAr={brandConfig.productCategoryAr}
              productCategoryEn={brandConfig.productCategoryEn}
              productTitleAr={brandConfig.productTitleAr}
              productTitleEn={brandConfig.productTitleEn}
              descriptionAr={brandConfig.descriptionAr}
              descriptionEn={brandConfig.descriptionEn}
              shortBenefitHeadlineAr={brandConfig.shortBenefitHeadlineAr}
              shortBenefitHeadlineEn={brandConfig.shortBenefitHeadlineEn}
              shortBenefitSubheadlineAr={brandConfig.shortBenefitSubheadlineAr}
              shortBenefitSubheadlineEn={brandConfig.shortBenefitSubheadlineEn}
              shortBenefitIntroAr={brandConfig.shortBenefitIntroAr}
              shortBenefitIntroEn={brandConfig.shortBenefitIntroEn}
              shortBenefitBulletsAr={brandConfig.shortBenefitBulletsAr}
              shortBenefitBulletsEn={brandConfig.shortBenefitBulletsEn}
              packages={PRODUCT_PACKAGES}
              variants={variants}
              gallerySlides={GALLERY_SLIDES}
              selectedPackageId={selectedPackageId}
              selectedVariantId={selectedVariantId}
              quantity={quantity}
              activeSlideIndex={activeSlideIndex}
              freeShippingThreshold={brandConfig.freeShippingThreshold}
              standardShippingFee={brandConfig.standardShippingFee}
              cairoShippingFee={brandConfig.cairoShippingFee}
              otherGovShippingFee={brandConfig.otherGovShippingFee}
              fomoRemainingPacks={brandConfig.fomoRemainingPacks}
              fomoWindowAr={brandConfig.fomoWindowAr}
              fomoWindowEn={brandConfig.fomoWindowEn}
              guaranteeLineAr={brandConfig.guaranteeLineAr}
              guaranteeLineEn={brandConfig.guaranteeLineEn}
              deliveryEstimateAr={brandConfig.deliveryEstimateAr}
              deliveryEstimateEn={brandConfig.deliveryEstimateEn}
              buttonState={buttonState}
              onSelectPackage={handleSelectPackage}
              onSelectVariant={handleSelectVariant}
              onChangeQuantity={handleChangeQuantity}
              onSelectSlide={(idx) => {
                setActiveSlideIndex(idx);
                trackConversionEvent('select_item', { slideIndex: idx });
              }}
              onAddToCart={handleAddToCart}
              onDirectOrderSubmit={(orderData) => {
                trackConversionEvent('begin_checkout', {
                  mode: 'direct_order_form',
                  quantity: orderData.quantity,
                  totalAmount: orderData.totalAmount,
                  governorate: orderData.governorate,
                });
              }}
              onOrderConfirmed={handleOrderConfirmed}
              onOpenShippingPolicy={() => setActiveInfoModal('shipping')}
              onOpenFullSpecsModal={() => setActiveInfoModal('specs')}
            />

            {/* SECTION 04: Product Benefits Bar */}
            <ProductBenefits
              benefits={PRODUCT_BENEFITS}
              currentLanguage={currentLanguage}
            />

            {/* SECTION 05: 3-Step How It Works Funnel Section */}
            <AthleteCarousel
              slides={ATHLETE_SLIDES}
              currentLanguage={currentLanguage}
              onCtaClick={() => {
                trackConversionEvent('how_it_works_cta_click', {
                  selectedPackageId,
                  selectedVariantId,
                });
                handleJumpToSection('product-hero');
              }}
            />

            {/* SECTION 06: 4 Reasons to Choose + Comparison Matrix */}
            <ComparisonTable
              brandNameAr={brandConfig.brandNameAr}
              brandNameEn={brandConfig.brandNameEn}
              currentLanguage={currentLanguage}
              onCtaClick={() => {
                trackConversionEvent('comparison_cta_click', {
                  selectedVariantId,
                  selectedPackageId,
                });
                handleJumpToSection('product-hero');
              }}
            />

            {/* SECTION 07: Package Contents Breakdown */}
            <VariantShowcase
              selectedVariantId={selectedVariantId}
              currentLanguage={currentLanguage}
              onSelectVariantAndScroll={(variantId) => {
                handleSelectVariant(variantId);
                handleJumpToSection('product-hero');
              }}
              onShopNowScroll={() => handleJumpToSection('product-hero')}
            />

            {/* SECTION 08: Minimal Visual Customer Reviews Section */}
            <CustomerReviews
              reviews={CUSTOMER_REVIEWS_DATA}
              currentLanguage={currentLanguage}
            />

            {/* SECTION 09: Categorized FAQ Accordion */}
            <FAQSection
              categories={FAQ_CATEGORIES}
              currentLanguage={currentLanguage}
              onExpandFaq={(faqId, questionAr) =>
                trackConversionEvent('faq_expand', { faqId, questionAr })
              }
              onOpenContactModal={() => setActiveInfoModal('contact')}
            />
          </>
        )}
      </main>

      {/* SECTION 10: Site Footer */}
      <SiteFooter
        brandNameAr={brandConfig.brandNameAr}
        brandNameEn={brandConfig.brandNameEn}
        currentLanguage={currentLanguage}
        onToggleLanguage={handleToggleLanguage}
        onNewsletterSignup={() =>
          trackConversionEvent('newsletter_signup', { subscribed: true })
        }
        onOpenPolicyModal={(type) => setActiveInfoModal(type)}
      />

      {/* Mobile Sticky Bottom Buy Bar (<= 15% mobile viewport height) */}
      {!confirmedOrder && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 h-[64px] bg-[#01181E]/95 backdrop-blur-md border-t border-white/15 px-4 flex items-center justify-between gap-3">
          <div className="flex flex-col text-start min-w-0">
            <span className="type-xs font-extrabold text-[#F4F3EF] truncate max-w-[175px]">
              {isEn ? resolvedPackPricing.packageNameEn : resolvedPackPricing.packageNameAr}
            </span>
            <span className="type-sm font-extrabold text-[#CEF90B] tabular-nums">
              {resolvedPackPricing.lineSaleTotal} {isEn ? 'EGP' : 'ج.م'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              buttonState === 'OUT_OF_STOCK' ||
              buttonState === 'VARIANT_UNAVAILABLE'
            }
            className="min-h-[44px] px-5 rounded-full bg-[#DDFE01] text-[#01181E] font-extrabold type-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {buttonState === 'OUT_OF_STOCK'
              ? isEn
                ? 'Sold Out'
                : 'نفذت الكمية'
              : isEn
              ? `Add to Cart (${quantity})`
              : `أضف للسلة (${quantity})`}
          </button>
        </div>
      )}

      {/* Slide-Over Navigation Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? 'Main Menu' : 'القائمة الرئيسية'}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-start"
          dir={isEn ? 'ltr' : 'rtl'}
        >
          <div className="w-full max-w-xs bg-[#021E26] text-[#F4F3EF] h-full p-6 flex flex-col justify-between border-e border-white/10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <img
                    src={brandConfig.logoPrimaryPath}
                    alt={brandConfig.brandNameEn}
                    className="h-8 w-auto"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xl font-extrabold text-[#CEF90B]">
                    {isEn ? brandConfig.brandNameEn : brandConfig.brandNameAr}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label={isEn ? 'Close menu' : 'إغلاق القائمة'}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 flex flex-col space-y-1 type-body font-bold">
                <a
                  href="#product-hero"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'Bundles' : 'الباقات'}
                </a>
                <a
                  href="#benefits-section"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'Benefits' : 'المميزات'}
                </a>
                <a
                  href="#athletes-section"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'How to Use' : 'طريقة الاستخدام'}
                </a>
                <a
                  href="#comparison-section"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'Compare' : 'المقارنة'}
                </a>
                <a
                  href="#colors-showcase"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'In the Box' : 'مكونات العبوة'}
                </a>
                <a
                  href="#reviews-section"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'Reviews' : 'التقييمات'}
                </a>
                <a
                  href="#faq-section"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center hover:text-[#CEF90B] transition-colors"
                >
                  {isEn ? 'FAQ' : 'الأسئلة'}
                </a>
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleToggleLanguage}
                className="w-full min-h-[48px] px-4 rounded-xl border border-white/20 bg-[#01181E] text-[#F4F3EF] hover:border-[#CEF90B] type-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-[#CEF90B]" />
                <span>{isEn ? 'العربية (RTL)' : 'English (LTR)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full min-h-[48px] px-4 rounded-xl bg-[#DDFE01] text-[#01181E] type-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isEn
                    ? `View Cart (${cartSummary.totalQuantity})`
                    : `عرض السلة (${cartSummary.totalQuantity})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        summary={cartSummary}
        currentLanguage={currentLanguage}
        cairoShippingFee={brandConfig.cairoShippingFee}
        otherGovShippingFee={brandConfig.otherGovShippingFee}
        deliveryEstimateAr={brandConfig.deliveryEstimateAr}
        deliveryEstimateEn={brandConfig.deliveryEstimateEn}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartLine}
        onRemoveItem={handleRemoveCartLine}
        onClearCart={() => setCartItems([])}
        onBeginCheckout={() =>
          trackConversionEvent('begin_checkout', {
            subtotal: cartSummary.subtotal,
            grandTotal: cartSummary.grandTotal,
            totalStrips: cartSummary.totalStrips,
          })
        }
        onOrderConfirmed={handleOrderConfirmed}
      />

      {/* Policy & Specs Modal */}
      <InfoPolicyModal
        modalType={activeInfoModal}
        currentLanguage={currentLanguage}
        brandNameAr={brandConfig.brandNameAr}
        brandNameEn={brandConfig.brandNameEn}
        freeShippingThreshold={brandConfig.freeShippingThreshold}
        standardShippingFee={brandConfig.standardShippingFee}
        cairoShippingFee={brandConfig.cairoShippingFee}
        otherGovShippingFee={brandConfig.otherGovShippingFee}
        deliveryEstimateAr={brandConfig.deliveryEstimateAr}
        deliveryEstimateEn={brandConfig.deliveryEstimateEn}
        contactEmail={brandConfig.contactEmail}
        contactLocationAr={brandConfig.contactLocationAr}
        contactLocationEn={brandConfig.contactLocationEn}
        onClose={() => setActiveInfoModal(null)}
      />
    </div>
  );
}
