import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import {
  formatCurrencyEGP,
  calculateShippingByGovernorate,
  type CartSummary,
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
import { GovernorateSelect } from './GovernorateSelect';

interface CartDrawerProps {
  isOpen: boolean;
  summary: CartSummary;
  currentLanguage?: 'ar' | 'en';
  cairoShippingFee?: number;
  otherGovShippingFee?: number;
  deliveryEstimateAr?: string;
  deliveryEstimateEn?: string;
  onClose: () => void;
  onUpdateQuantity: (packageId: string, variantId: string, newQty: number) => void;
  onRemoveItem: (packageId: string, variantId: string) => void;
  onClearCart: () => void;
  onBeginCheckout: () => void;
  onOrderConfirmed?: (confirmedOrder: ConfirmedOrderRecord) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  summary,
  currentLanguage = 'ar',
  cairoShippingFee = 85,
  otherGovShippingFee = 95,
  deliveryEstimateAr = '48 ساعة قدام بيتك',
  deliveryEstimateEn = '48h to your door',
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBeginCheckout,
  onOrderConfirmed,
}) => {
  const isEn = currentLanguage === 'en';
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout-form' | 'confirmed'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('القاهرة');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingCartOrder, setIsSubmittingCartOrder] = useState(false);
  const [confirmedCartOrderId, setConfirmedCartOrderId] = useState('');
  const [submissionId, setSubmissionId] = useState<string>(() => generateSubmissionId());

  if (!isOpen) return null;

  const activeShippingCost = calculateShippingByGovernorate(
    summary.subtotal,
    customerCity,
    summary.shippingProgress.threshold,
    cairoShippingFee,
    otherGovShippingFee
  );
  const activeGrandTotal = summary.subtotal + activeShippingCost;
  const currencyLabel = isEn ? 'EGP' : 'ج.م';

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingCartOrder) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setFormError(
        isEn
          ? 'Please enter your name, phone, and address.'
          : 'اكتب الاسم ورقم الموبايل والعنوان بالتفصيل.'
      );
      return;
    }

    const normalizedPhone = normalizePhoneString(customerPhone);
    if (!isValidCustomerPhone(normalizedPhone)) {
      setFormError(
        isEn
          ? 'Please enter a valid 11-digit mobile number (e.g. 010xxxxxxxx).'
          : 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم (مثال: 010xxxxxxxx).'
      );
      return;
    }

    setFormError('');
    setIsSubmittingCartOrder(true);

    const result = await submitOrderToServer({
      submission_id: submissionId,
      checkout_source: 'cart_drawer',
      customer_name: customerName.trim(),
      customer_phone: normalizedPhone,
      governorate: customerCity.trim(),
      detailed_address: customerAddress.trim(),
      delivery_notes: customerNote.trim(),
      customer_notes: customerNote.trim(),
      items: summary.items.map((item) => ({
        packageId: item.packageId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });

    setIsSubmittingCartOrder(false);

    if (!result.ok || !result.orderId) {
      setFormError(
        isEn
          ? result.messageEn || 'Could not confirm your order. Please try again.'
          : result.messageAr || 'تعذر تسجيل الطلب حالياً. يرجى المحاولة مرة أخرى.'
      );
      return;
    }

    setConfirmedCartOrderId(result.orderId);
    setCheckoutStep('confirmed');
    setSubmissionId(generateSubmissionId());

    if (onOrderConfirmed && result.confirmedOrder) {
      setCheckoutStep('cart');
      onClearCart();
      onClose();
      onOrderConfirmed(result.confirmedOrder);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'Shopping Cart' : 'سلة التسوق'}
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div className="relative w-full max-w-md bg-[#021E26] text-[#F4F3EF] h-full flex flex-col justify-between border-s border-white/10 shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#01181E]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#CEF90B]" />
            <h2 className="type-h3 font-extrabold">
              {checkoutStep === 'cart'
                ? isEn
                  ? `Cart (${summary.totalQuantity})`
                  : `سلة التسوق (${summary.totalQuantity})`
                : checkoutStep === 'checkout-form'
                ? isEn
                  ? 'Cash on Delivery'
                  : 'إتمام الطلب (الدفع عند الاستلام)'
                : isEn
                ? 'Order Confirmed'
                : 'تأكيد الطلب'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setCheckoutStep('cart');
              onClose();
            }}
            aria-label={isEn ? 'Close cart' : 'إغلاق السلة'}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#C2CFD4] hover:text-[#CEF90B] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar inside Cart */}
        {summary.items.length > 0 && checkoutStep !== 'confirmed' && (
          <div className="px-6 py-3 bg-[#042832] border-b border-white/10">
            <div className="flex items-center justify-between type-xs mb-2">
              <span className="inline-flex items-center gap-2 font-bold">
                <Truck className="w-4 h-4 text-[#CEF90B]" />
                {summary.shippingProgress.isEligible ? (
                  <span className="text-[#CEF90B]">
                    {isEn ? 'You unlocked free shipping!' : 'طلبك عليه شحن مجاني!'}
                  </span>
                ) : (
                  <span>
                    {isEn ? (
                      <>
                        Add{' '}
                        <strong className="text-[#CEF90B] tabular-nums">
                          {summary.shippingProgress.remainingAmount} EGP
                        </strong>{' '}
                        for free shipping
                      </>
                    ) : (
                      <>
                        باقي{' '}
                        <strong className="text-[#CEF90B] tabular-nums">
                          {summary.shippingProgress.remainingAmount} ج.م
                        </strong>{' '}
                        على الشحن المجاني
                      </>
                    )}
                  </span>
                )}
              </span>
              <span className="tabular-nums text-[#C2CFD4] font-semibold">
                {summary.shippingProgress.progressPercentage}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#01181E] overflow-hidden">
              <div
                className="h-full bg-[#DDFE01] transition-all duration-300"
                style={{ width: `${summary.shippingProgress.progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {summary.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-[#CEF90B]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="type-h3 font-bold text-[#F4F3EF]">
                {isEn ? 'Your cart is empty' : 'السلة فاضية حالياً'}
              </p>
              <p className="type-sm text-[#C2CFD4] mt-1 max-w-xs">
                {isEn
                  ? 'Pick a bundle for 48h door delivery.'
                  : 'اختار عرضك المفضل وهيوصلك في 48 ساعة.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 min-h-[48px] px-6 rounded-full bg-[#DDFE01] text-[#01181E] font-extrabold type-sm cursor-pointer"
              >
                {isEn ? 'Shop Bundles' : 'اختار عبوتك الآن'}
              </button>
            </div>
          ) : checkoutStep === 'cart' ? (
            <>
              {summary.items.map((item) => (
                <div
                  key={item.lineId}
                  data-testid={`cart-line-${item.lineId}`}
                  className="p-4 rounded-xl bg-[#042630] border border-white/10 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="type-sm font-extrabold text-[#F4F3EF]">
                            {isEn
                              ? 'SHAHEEQ V2 — 30-Piece Pack'
                              : 'عبوة شهيق V2 (30 قطعة)'}
                          </h3>
                          <span className="px-2 py-0.5 rounded bg-[#CEF90B]/15 border border-[#CEF90B]/35 text-[#CEF90B] type-xs font-extrabold">
                            {isEn ? item.packageNameEn : item.packageNameAr}
                          </span>
                        </div>
                        <p className="type-xs text-[#C2CFD4] mt-0.5">
                          {isEn
                            ? `${item.totalStrips} tabs (24h) + ${item.packsCount * 4} clips + tool`
                            : `${item.totalStrips} لاصقة (24 ساعة) + المشابك + الأداة`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onRemoveItem(item.packageId, item.variantId);
                        setSubmissionId(generateSubmissionId());
                      }}
                      aria-label={
                        isEn
                          ? `Remove ${item.packageNameEn}`
                          : `حذف ${item.packageNameAr} من السلة`
                      }
                      className="w-11 h-11 min-w-[44px] min-h-[44px] text-[#C2CFD4] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 bg-[#01181E] rounded-full px-1.5 py-0.5 border border-white/15">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateQuantity(
                            item.packageId,
                            item.variantId,
                            item.packsCount - 1
                          );
                          setSubmissionId(generateSubmissionId());
                        }}
                        aria-label={isEn ? 'Decrease quantity' : 'تقليل الكمية في السلة'}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] type-body font-bold text-[#CEF90B] flex items-center justify-center cursor-pointer"
                      >
                        −
                      </button>
                      <span className="type-sm font-extrabold tabular-nums px-2">
                        {item.packsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateQuantity(
                            item.packageId,
                            item.variantId,
                            item.packsCount + 1
                          );
                          setSubmissionId(generateSubmissionId());
                        }}
                        aria-label={isEn ? 'Increase quantity' : 'زيادة الكمية في السلة'}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] type-body font-bold text-[#CEF90B] flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-left" dir="ltr">
                      <div className="type-sm font-extrabold text-[#CEF90B] tabular-nums">
                        {formatCurrencyEGP(item.lineSaleTotal, 'LE')}
                      </div>
                      {item.lineRegularTotal > item.lineSaleTotal && (
                        <div className="type-xs text-[#C2CFD4]/70 line-through tabular-nums">
                          {formatCurrencyEGP(item.lineRegularTotal, 'LE')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setSubmissionId(generateSubmissionId());
                  }}
                  className="min-h-[44px] px-2 type-xs text-[#C2CFD4] hover:text-red-400 underline underline-offset-4 cursor-pointer"
                >
                  {isEn ? 'Clear Cart' : 'إفراغ السلة'}
                </button>
              </div>
            </>
          ) : checkoutStep === 'checkout-form' ? (
            <form id="checkout-cod-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#042832] border border-[#CEF90B]/25 type-xs text-[#F4F3EF]">
                <div className="font-bold text-[#CEF90B]">
                  {isEn
                    ? `${deliveryEstimateEn} • Cash on Delivery`
                    : `${deliveryEstimateAr} • الدفع عند الاستلام`}
                </div>
              </div>

              <div>
                <label htmlFor="cod-name" className="block type-xs font-bold mb-1.5">
                  {isEn ? 'Full Name *' : 'الاسم بالكامل *'}
                </label>
                <input
                  id="cod-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isEn ? 'Your full name' : 'اكتب اسمك الثلاثي'}
                  className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-sm focus:border-[#CEF90B] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="cod-phone" className="block type-xs font-bold mb-1.5">
                  {isEn ? 'Mobile Number *' : 'رقم الموبايل *'}
                </label>
                <input
                  id="cod-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-sm focus:border-[#CEF90B] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="cod-city" className="block type-xs font-bold mb-1.5">
                  {isEn
                    ? `Governorate * (Cairo ${cairoShippingFee} EGP • Other ${otherGovShippingFee} EGP)`
                    : `المحافظة * (القاهرة ${cairoShippingFee} ج.م • المحافظات ${otherGovShippingFee} ج.م)`}
                </label>
                <GovernorateSelect
                  id="cod-city"
                  value={customerCity}
                  onChange={(newGov) => setCustomerCity(newGov)}
                  isEn={isEn}
                  isFreeShipping={activeShippingCost === 0}
                  cairoFee={cairoShippingFee}
                  otherGovFee={otherGovShippingFee}
                />
              </div>

              <div>
                <label htmlFor="cod-address" className="block type-xs font-bold mb-1.5">
                  {isEn ? 'Street Address *' : 'العنوان بالتفصيل *'}
                </label>
                <textarea
                  id="cod-address"
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Area, street, building number'
                      : 'المنطقة، الشارع، رقم العقار'
                  }
                  className="w-full p-3 rounded-lg bg-[#01181E] border border-white/20 type-sm focus:border-[#CEF90B] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="cod-note" className="block type-xs font-bold mb-1.5">
                  {isEn ? 'Notes (Optional)' : 'ملحوظة (اختياري)'}
                </label>
                <input
                  id="cod-note"
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={
                    isEn ? 'Extra phone or delivery note' : 'رقم تاني أو ميعاد مناسب'
                  }
                  className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-xs focus:border-[#CEF90B] focus:outline-none"
                />
              </div>

              {formError && (
                <div role="alert" className="type-xs text-red-400 font-bold">
                  {formError}
                </div>
              )}
            </form>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#CEF90B]/20 text-[#CEF90B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="type-h3 font-extrabold text-[#CEF90B]">
                {isEn ? 'Order Recorded Successfully!' : 'تم تسجيل طلبك بنجاح!'}
              </h3>
              {confirmedCartOrderId && (
                <div
                  data-testid="cart-confirmed-order-id"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#CEF90B]/15 border border-[#CEF90B]/35 text-[#CEF90B] type-xs font-extrabold tabular-nums"
                >
                  <span>{isEn ? 'Order ID:' : 'رقم الطلب:'}</span>
                  <span>{confirmedCartOrderId}</span>
                </div>
              )}
              <p className="type-sm text-[#F4F3EF] leading-relaxed">
                {isEn ? (
                  <>
                    Thank you <strong>{customerName}</strong>. Your order has been recorded and
                    will be prepared for delivery • Total on delivery:{' '}
                    <strong className="text-[#CEF90B] tabular-nums">
                      {activeGrandTotal} EGP
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    شكراً يا <strong>{customerName}</strong> ({customerCity}). تم استلام وتسجيل
                    طلبك وسيتم تجهيزه للتوصيل • الإجمالي عند الاستلام:{' '}
                    <strong className="text-[#CEF90B] tabular-nums">
                      {activeGrandTotal} ج.م
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer Totals */}
        {summary.items.length > 0 && (
          <div className="p-6 bg-[#01181E] border-t border-white/10 space-y-3">
            <div className="space-y-1.5 type-xs">
              <div className="flex justify-between text-[#C2CFD4]">
                <span>
                  {isEn
                    ? `Subtotal (${summary.totalQuantity}):`
                    : `إجمالي العبوات (${summary.totalQuantity}):`}
                </span>
                <span className="tabular-nums font-bold text-[#F4F3EF]">
                  {summary.subtotal} {currencyLabel}
                </span>
              </div>

              {summary.totalSavings > 0 && (
                <div className="flex justify-between text-[#CEF90B]">
                  <span>
                    {isEn
                      ? `You Save (${summary.totalSavingsPercent}%):`
                      : `وفّرت (${summary.totalSavingsPercent}%):`}
                  </span>
                  <span className="tabular-nums font-bold">
                    - {summary.totalSavings} {currencyLabel}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#C2CFD4]">
                <span>{isEn ? 'Shipping (48h):' : `الشحن (${customerCity} • 48 ساعة):`}</span>
                <span className="font-bold text-[#CEF90B]">
                  {activeShippingCost === 0
                    ? isEn
                      ? 'Free'
                      : 'شحن مجاني'
                    : `${activeShippingCost} ${currencyLabel}`}
                </span>
              </div>

              <div className="flex justify-between type-body font-extrabold text-[#F4F3EF] pt-2 border-t border-white/10">
                <span>{isEn ? 'Total:' : 'الإجمالي:'}</span>
                <span
                  data-testid="cart-grand-total"
                  className="text-[#CEF90B] tabular-nums"
                >
                  {activeGrandTotal} {currencyLabel}
                </span>
              </div>
            </div>

            {checkoutStep === 'cart' && (
              <button
                type="button"
                onClick={() => {
                  onBeginCheckout();
                  setFormError('');
                  setCheckoutStep('checkout-form');
                }}
                data-testid="proceed-to-checkout-btn"
                className="w-full min-h-[48px] rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-btn font-extrabold transition-transform active:scale-98 cursor-pointer"
              >
                {isEn
                  ? `Checkout • ${activeGrandTotal} EGP`
                  : `إتمام الطلب — ${activeGrandTotal} ج.م`}
              </button>
            )}

            {checkoutStep === 'checkout-form' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSubmittingCartOrder}
                  onClick={() => setCheckoutStep('cart')}
                  className="px-5 min-h-[48px] rounded-full border border-white/25 type-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isEn ? 'Back' : 'رجوع'}
                </button>
                <button
                  type="submit"
                  form="checkout-cod-form"
                  disabled={isSubmittingCartOrder}
                  data-testid="cart-confirm-order-btn"
                  className="flex-1 min-h-[48px] rounded-full bg-[#DDFE01] text-[#01181E] type-btn font-extrabold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmittingCartOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEn ? 'Recording...' : 'جاري التسجيل...'}</span>
                    </>
                  ) : (
                    <span>
                      {isEn
                        ? `Confirm (${activeGrandTotal} EGP)`
                        : `تأكيد الطلب (${activeGrandTotal} ج.م)`}
                    </span>
                  )}
                </button>
              </div>
            )}

            {checkoutStep === 'confirmed' && (
              <button
                type="button"
                onClick={() => {
                  setCheckoutStep('cart');
                  onClearCart();
                  onClose();
                }}
                className="w-full min-h-[48px] rounded-full bg-[#DDFE01] text-[#01181E] type-btn font-extrabold cursor-pointer"
              >
                {isEn ? 'Back to Store' : 'العودة للمتجر'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoModalProps {
  modalType: 'privacy' | 'refund' | 'shipping' | 'contact' | 'specs' | null;
  currentLanguage?: 'ar' | 'en';
  brandNameAr: string;
  brandNameEn?: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  cairoShippingFee?: number;
  otherGovShippingFee?: number;
  deliveryEstimateAr: string;
  deliveryEstimateEn?: string;
  contactEmail: string;
  contactLocationAr: string;
  contactLocationEn?: string;
  onClose: () => void;
}

export const InfoPolicyModal: React.FC<InfoModalProps> = ({
  modalType,
  currentLanguage = 'ar',
  brandNameAr,
  brandNameEn = 'SHAHEEQ',
  freeShippingThreshold,
  cairoShippingFee = 85,
  otherGovShippingFee = 95,
  deliveryEstimateAr,
  deliveryEstimateEn = '48h to your door',
  contactEmail,
  contactLocationAr,
  contactLocationEn = 'Cairo, Egypt',
  onClose,
}) => {
  if (!modalType) return null;
  const isEn = currentLanguage === 'en';

  const contentMap = isEn
    ? {
        shipping: {
          title: `Shipping Policy — ${brandNameEn}`,
          body: [
            `• Fast Delivery: ${deliveryEstimateEn}.`,
            `• Free Shipping: 100% Free on orders over ${freeShippingThreshold} EGP (2-Pack Best Offer or 3-Pack).`,
            `• Standard Shipping (below ${freeShippingThreshold} EGP): ${cairoShippingFee} EGP for Cairo, ${otherGovShippingFee} EGP for other governorates.`,
            '• Cash on Delivery available across Egypt.',
          ],
        },
        refund: {
          title: `Returns & Guarantee — ${brandNameEn}`,
          body: [
            '• 24-Hour Magnetic & Adhesive Hold Guarantee = 30 full days of reliable use.',
            '• Sealed packs can be returned within 14 days. Instant free replacement for any defect.',
          ],
        },
        privacy: {
          title: `Privacy Policy — ${brandNameEn}`,
          body: [
            '• Your name, phone, and address are used strictly to deliver your order within 48 hours.',
          ],
        },
        contact: {
          title: `Contact ${brandNameEn}`,
          body: [
            `• Email: ${contactEmail}`,
            `• Location: ${contactLocationEn}`,
          ],
        },
        specs: {
          title: 'Kit Contents & Guarantee',
          body: [
            '• 30 Magnetic Tabs (24-hour magnetic hold = 30 full days).',
            '• 4 Reusable Nose Clips (Sizes S1, S2, M1, M2).',
            '• 1 Magnetic Applicator Tool for quick placement.',
          ],
        },
      }[modalType]
    : {
        shipping: {
          title: `الشحن والتوصيل — ${brandNameAr}`,
          body: [
            `• التوصيل السريع: ${deliveryEstimateAr}.`,
            `• الشحن المجاني: مجاناً تماماً للطلبات فوق ${freeShippingThreshold} ج.م (مثل عرض العبوتين أو 3 عبوات).`,
            `• مصاريف الشحن (أقل من ${freeShippingThreshold} ج.م): ${cairoShippingFee} ج.م للقاهرة، و${otherGovShippingFee} ج.م لباقي المحافظات.`,
            '• الدفع عند الاستلام متاح لجميع المحافظات.',
          ],
        },
        refund: {
          title: `سياسة الاستبدال والضمان — ${brandNameAr}`,
          body: [
            '• ضمان ثبات المغناطيس واللاصق 24 ساعة = 30 يوم استخدام كامل.',
            '• استبدال أو استرجاع العبوات المغلقة خلال 14 يوماً، واستبدال فوري لأي عيب مصنعي.',
          ],
        },
        privacy: {
          title: `الخصوصية — ${brandNameAr}`,
          body: [
            '• بياناتك بتستخدم فقط لتوصيل طلبك لحد باب البيت في 48 ساعة.',
          ],
        },
        contact: {
          title: `تواصل مع ${brandNameAr}`,
          body: [
            `• البريد الإلكتروني: ${contactEmail}`,
            `• المقر: ${contactLocationAr}`,
          ],
        },
        specs: {
          title: 'مكونات العبوة والضمان',
          body: [
            '• 30 لاصقة مغناطيسية بثبات 24 ساعة = 30 يوم كاملين.',
            '• 4 مقاسات مشابك أنفية (S1, S2, M1, M2) في نفس العلبة.',
            '• أداة تثبيت مغناطيسية لتركيب اللاصقة في ثواني.',
          ],
        },
      }[modalType];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={contentMap.title}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div className="w-full max-w-lg bg-[#021E26] text-[#F4F3EF] rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-[#01181E] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#CEF90B]" />
            <h2 className="type-h3 font-extrabold">{contentMap.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close modal' : 'إغلاق النافذة'}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 type-body text-[#C2CFD4] font-medium">
          {contentMap.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="px-6 py-4 bg-[#01181E] border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 rounded-full bg-[#DDFE01] text-[#01181E] font-extrabold type-xs cursor-pointer"
          >
            {isEn ? 'Close' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};
