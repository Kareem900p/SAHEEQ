import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Truck,
  ShieldCheck,
  Package,
  MapPin,
  Phone,
  User,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Printer,
  Edit3,
  Loader2,
  Receipt,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ConfirmedOrderRecord } from '../utils/orderClient';
import {
  generateSubmissionId,
  submitOrderToServer,
} from '../utils/orderClient';
import {
  normalizePhoneString,
  isValidCustomerPhone,
  generateServerOrderId,
} from '../utils/orderIntake';
import {
  resolvePackQuantityPricing,
  packCountToCartItem,
  calculateShippingByGovernorate,
} from '../utils/ecommerceMath';
import { PRODUCT_PACKAGES, INITIAL_BRAND_CONFIG } from '../data/brandConfig';
import { GovernorateSelect } from './GovernorateSelect';

interface ThankYouPageProps {
  order: ConfirmedOrderRecord;
  currentLanguage?: 'ar' | 'en';
  onUpdateConfirmedOrder: (updatedOrder: ConfirmedOrderRecord) => void;
  onBackToStore: () => void;
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

/**
 * Reliable clipboard helper that works both in top-level windows and inside sandboxed iframes.
 */
async function copyTextSafe(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to textarea execCommand below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  order,
  currentLanguage = 'ar',
  onUpdateConfirmedOrder,
  onBackToStore,
}) => {
  const isEn = currentLanguage === 'en';
  const currencyLabel = isEn ? 'EGP' : 'ج.م';

  const { orderFields, itemsSummary, totalStrips } = order;

  // Ensure concise SHQ-DDMM-XXX reference order ID (SHQ + today's date + last 3 phone digits)
  const displayOrderId =
    order.orderId && /^SHQ-\d{4}-\d{3}$/.test(order.orderId)
      ? order.orderId
      : generateServerOrderId(orderFields.customer_phone);

  // Compute current pack count from itemsSummary or totalStrips
  const currentPackCount = Math.max(
    1,
    itemsSummary?.[0]?.packsCount || Math.round((totalStrips || 30) / 30)
  );

  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedIdOnly, setCopiedIdOnly] = useState(false);
  const [printTriggered, setPrintTriggered] = useState(false);

  // Interactive Compact Quantity / Upgrade State
  const [selectedQty, setSelectedQty] = useState<number>(currentPackCount);
  const [isUpdatingQty, setIsUpdatingQty] = useState(false);
  const [qtyUpdatedSuccess, setQtyUpdatedSuccess] = useState(false);

  useEffect(() => {
    setSelectedQty(currentPackCount);
  }, [currentPackCount]);

  // Inline Edit Customer Delivery Details State
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editName, setEditName] = useState(orderFields.customer_name);
  const [editPhone, setEditPhone] = useState(orderFields.customer_phone);
  const [editGovernorate, setEditGovernorate] = useState(orderFields.governorate);
  const [editAddress, setEditAddress] = useState(orderFields.detailed_address);
  const [editNotes, setEditNotes] = useState(orderFields.customer_notes);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSavedSuccess, setEditSavedSuccess] = useState(false);

  const priceBeforeDiscount =
    orderFields.product_total + orderFields.discount_amount;

  // Preview pricing for the interactive compact quantity adjuster
  const previewPricing = resolvePackQuantityPricing(selectedQty, PRODUCT_PACKAGES);
  const previewShipping = calculateShippingByGovernorate(
    previewPricing.lineSaleTotal,
    orderFields.governorate,
    INITIAL_BRAND_CONFIG.freeShippingThreshold,
    INITIAL_BRAND_CONFIG.cairoShippingFee,
    INITIAL_BRAND_CONFIG.otherGovShippingFee
  );
  const previewTotalCod = previewPricing.lineSaleTotal + previewShipping;

  const formattedOrderSummaryText = isEn
    ? `SHAHEEQ V2 Order Summary\nOrder ID: ${displayOrderId}\nCustomer: ${orderFields.customer_name}\nPhone: ${orderFields.customer_phone}\nAddress: ${orderFields.governorate} - ${orderFields.detailed_address}\nPackage: ${orderFields.product_variant} (${totalStrips} Magnetic Tabs)\nTotal Due on Delivery (COD): ${orderFields.cod_amount} EGP`
    : `فاتورة طلب شهيق V2\nرقم الطلب: ${displayOrderId}\nالعميل: ${orderFields.customer_name}\nالموبايل: ${orderFields.customer_phone}\nالعنوان: ${orderFields.governorate} — ${orderFields.detailed_address}\nالمنتج: ${orderFields.product_variant} (${totalStrips} لاصقة مغناطيسية)\nالإجمالي المطلوب عند الاستلام: ${orderFields.cod_amount} ج.م`;

  const handleCopyFullOrder = async () => {
    await copyTextSafe(formattedOrderSummaryText);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 3000);
  };

  const handleCopyOrderIdOnly = async () => {
    await copyTextSafe(displayOrderId);
    setCopiedIdOnly(true);
    setTimeout(() => setCopiedIdOnly(false), 2500);
  };

  const handlePrintInvoice = () => {
    setPrintTriggered(true);
    setTimeout(() => {
      try {
        window.print();
      } catch {
        // Fallback if sandboxed iframe blocks print dialog
      }
    }, 60);
    setTimeout(() => setPrintTriggered(false), 4500);
  };

  const handleApplyQuantityChange = async (targetPackCount: number) => {
    const safeCount = Math.max(1, Math.min(20, targetPackCount));
    if (isUpdatingQty || safeCount === currentPackCount) return;

    setSelectedQty(safeCount);
    setIsUpdatingQty(true);
    setQtyUpdatedSuccess(false);

    const variantId = order.rawItems[0]?.variantId || 'black';
    const updatedItem = packCountToCartItem(safeCount, variantId);
    const resolved = resolvePackQuantityPricing(safeCount, PRODUCT_PACKAGES);

    const updateNote = `${
      orderFields.customer_notes ? orderFields.customer_notes + ' | ' : ''
    }تعديل الكمية للطلب (${displayOrderId}) إلى: ${resolved.packageNameAr}`;

    const result = await submitOrderToServer({
      submission_id: generateSubmissionId(),
      checkout_source: order.checkoutSource,
      customer_name: orderFields.customer_name,
      customer_phone: orderFields.customer_phone,
      alternate_phone: orderFields.alternate_phone,
      governorate: orderFields.governorate,
      city_or_area: orderFields.city_or_area,
      detailed_address: orderFields.detailed_address,
      delivery_notes: updateNote,
      customer_notes: orderFields.customer_notes,
      items: [updatedItem],
    });

    setIsUpdatingQty(false);

    if (result.ok && result.confirmedOrder) {
      setQtyUpdatedSuccess(true);
      onUpdateConfirmedOrder({
        ...result.confirmedOrder,
        orderId: displayOrderId,
      });
      setTimeout(() => setQtyUpdatedSuccess(false), 3500);
    }
  };

  const handleSaveEditedDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingEdit) return;

    if (!editName.trim() || !editPhone.trim() || !editGovernorate.trim() || !editAddress.trim()) {
      setEditError(
        isEn
          ? 'Please fill in your name, phone, governorate, and detailed address.'
          : 'يرجى ملء الاسم ورقم الموبايل والمحافظة والعنوان بالتفصيل.'
      );
      return;
    }

    const normalizedPhone = normalizePhoneString(editPhone);
    if (!isValidCustomerPhone(normalizedPhone)) {
      setEditError(
        isEn
          ? 'Please enter a valid 11-digit mobile number (e.g. 010xxxxxxxx).'
          : 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم (مثال: 010xxxxxxxx).'
      );
      return;
    }

    setEditError('');
    setIsSavingEdit(true);

    const variantId = order.rawItems[0]?.variantId || 'black';
    const result = await submitOrderToServer({
      submission_id: generateSubmissionId(),
      checkout_source: order.checkoutSource,
      customer_name: editName.trim(),
      customer_phone: normalizedPhone,
      governorate: editGovernorate.trim(),
      detailed_address: editAddress.trim(),
      delivery_notes: editNotes.trim(),
      customer_notes: editNotes.trim(),
      items: [packCountToCartItem(currentPackCount, variantId)],
    });

    setIsSavingEdit(false);

    if (result.ok && result.confirmedOrder) {
      const updatedOrderId = generateServerOrderId(normalizedPhone);
      onUpdateConfirmedOrder({
        ...result.confirmedOrder,
        orderId: updatedOrderId,
      });
      setIsEditingDetails(false);
      setEditSavedSuccess(true);
      setTimeout(() => setEditSavedSuccess(false), 3500);
    } else {
      setEditError(
        isEn
          ? result.messageEn || 'Could not update details. Please check your input.'
          : result.messageAr || 'تعذر تحديث البيانات حالياً. يرجى مراجعة الحقول.'
      );
    }
  };

  const orderDateFormatted = new Date(order.createdAtIso || Date.now()).toLocaleDateString(
    isEn ? 'en-EG' : 'ar-EG',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <section
      data-testid="thank-you-page"
      aria-label={isEn ? 'Order Confirmation & Official Invoice' : 'صفحة تأكيد الطلب والفاتورة'}
      className="w-full py-6 sm:py-10 bg-[#01181E] text-[#F4F3EF]"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div className="layout-container max-w-4xl space-y-5">
        {/* TOP ACTION BAR: Back to Store + Copy Order + Print Invoice */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <button
            type="button"
            onClick={onBackToStore}
            data-testid="back-to-store-btn"
            className="min-h-[44px] px-4 rounded-xl bg-[#021E26] hover:bg-[#032833] border border-white/15 text-[#F4F3EF] hover:text-[#CEF90B] type-xs font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isEn ? (
              <ArrowLeft className="w-4 h-4 text-[#CEF90B]" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#CEF90B]" />
            )}
            <span>{isEn ? 'Back to Store' : 'العودة إلى المتجر'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFullOrder}
              data-testid="copy-order-id-btn"
              className="min-h-[44px] px-4 rounded-xl bg-[#021E26] hover:bg-[#032833] border border-[#CEF90B]/40 text-[#CEF90B] type-xs font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedOrder ? (
                <Check className="w-4 h-4 text-[#CEF90B]" />
              ) : (
                <Copy className="w-4 h-4 text-[#CEF90B]" />
              )}
              <span>
                {copiedOrder
                  ? isEn
                    ? 'Order Copied!'
                    : 'تم نسخ الطلب!'
                  : isEn
                  ? 'Copy Order'
                  : 'نسخ الطلب'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintInvoice}
              data-testid="print-invoice-btn"
              className="min-h-[44px] px-4 rounded-xl bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-xs font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{isEn ? 'Print Invoice' : 'طباعة الفاتورة'}</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE FEEDBACK BANNERS FOR COPY / PRINT */}
        {copiedOrder && (
          <div
            role="status"
            data-testid="copy-order-feedback"
            className="no-print p-3.5 rounded-xl bg-[#032833] border border-[#CEF90B]/50 text-[#CEF90B] type-xs font-extrabold flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isEn
                  ? `Order (${displayOrderId}) and full invoice details copied to clipboard.`
                  : `تم نسخ رقم الطلب (${displayOrderId}) وملخص الفاتورة بنجاح إلى الحافظة.`}
              </span>
            </div>
          </div>
        )}

        {printTriggered && (
          <div
            role="status"
            data-testid="print-invoice-feedback"
            className="no-print p-3.5 rounded-xl bg-[#032833] border border-[#CEF90B]/50 text-[#CEF90B] type-xs font-extrabold flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 shrink-0" />
              <span>
                {isEn
                  ? 'Invoice prepared for printing. You can also press Ctrl+P (or Cmd+P) to save as PDF.'
                  : 'تم تجهيز الفاتورة للطباعة — يمكنك أيضاً الضغط على Ctrl+P لحفظها كملف PDF.'}
              </span>
            </div>
          </div>
        )}

        {/* HERO CONFIRMATION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-[#021E26] border border-[#CEF90B]/40 p-5 sm:p-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#DDFE01] text-[#01181E] flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(221,254,1,0.25)]">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 type-xs text-[#CEF90B] font-extrabold">
                  <span>
                    {isEn ? 'Order Confirmed' : 'تم تأكيد طلبك بنجاح'}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {isEn ? '48h Door Delivery' : 'التوصيل خلال 48 ساعة'}
                  </span>
                </div>

                <h1
                  data-testid="thank-you-heading"
                  className="type-h2 font-extrabold text-[#F4F3EF] leading-tight"
                >
                  {isEn
                    ? `Thank you, ${orderFields.customer_name}!`
                    : `شكراً لك يا ${orderFields.customer_name}!`}
                </h1>

                <p className="type-xs sm:type-sm text-[#C2CFD4]">
                  {isEn
                    ? 'Your order is registered and being prepared for dispatch.'
                    : 'تم تسجيل بياناتك وحجز عبوتك، وسيتواصل معك المندوب لتسليم الشحنة.'}
                </p>
              </div>
            </div>

            {/* SHORT REFERENCE ORDER ID BADGE WITH 1-CLICK COPY */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
              <div className="type-xs text-[#C2CFD4] font-bold">
                {isEn ? 'Reference Order ID' : 'رقم الطلب المرجعي'}
              </div>
              <button
                type="button"
                onClick={handleCopyOrderIdOnly}
                title={isEn ? 'Click to copy Order ID' : 'اضغط لنسخ رقم الطلب'}
                className="px-3 py-1.5 rounded-xl bg-[#01181E] hover:bg-[#032833] border border-[#CEF90B]/40 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span
                  data-testid="thank-you-order-id"
                  dir="ltr"
                  className="text-lg sm:text-xl font-extrabold text-[#CEF90B] tabular-nums tracking-wider"
                >
                  {displayOrderId}
                </span>
                {copiedIdOnly ? (
                  <Check className="w-4 h-4 text-[#CEF90B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#C2CFD4]" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* COMPACT SINGLE-FRAME QUANTITY / BUNDLE UPGRADE BAR */}
        <div
          data-testid="vip-upsell-card"
          className="no-print rounded-2xl bg-[#032630] border border-[#CEF90B]/50 p-4 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-5 h-5 text-[#CEF90B] shrink-0" />
            <div className="min-w-0">
              <div className="type-xs sm:type-sm font-extrabold text-[#F4F3EF]">
                {currentPackCount === 1
                  ? isEn
                    ? 'Want to increase quantity? Make it 2 Packs (595 EGP + Free Shipping)!'
                    : 'عايز تزود الكمية؟ خليها عبوتين بـ 595 ج.م شامل الشحن المجاني!'
                  : currentPackCount === 2
                  ? isEn
                    ? 'Want maximum savings? Upgrade to 3 Packs (820 EGP + Free Shipping)!'
                    : 'عايز التوفير الأقصى؟ خليها 3 عبوات بـ 820 ج.م شامل الشحن المجاني!'
                  : isEn
                  ? 'Adjust your order pack quantity anytime before dispatch:'
                  : 'تقدر تعدّل عدد العبوات في طلبك مباشرة قبل خروج الشحنة:'}
              </div>
              {qtyUpdatedSuccess && (
                <div
                  role="status"
                  data-testid="vip-upsell-confirmed"
                  className="type-xs text-[#CEF90B] font-extrabold mt-0.5 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isEn
                      ? `Quantity updated to ${currentPackCount} pack(s) (${totalStrips} tabs)!`
                      : `تم تحديث الكمية في الفاتورة إلى ${currentPackCount} عبوة (${totalStrips} لاصقة)!`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* Compact Stepper (- / qty / +) */}
            <div className="flex items-center gap-1 bg-[#01181E] px-1.5 py-0.5 rounded-full border border-white/15">
              <button
                type="button"
                disabled={isUpdatingQty || selectedQty <= 1}
                data-testid="ty-qty-minus"
                onClick={() => handleApplyQuantityChange(selectedQty - 1)}
                className="w-9 h-9 min-w-[36px] min-h-[36px] type-body font-extrabold text-[#CEF90B] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                aria-label={isEn ? 'Decrease quantity' : 'تقليل الكمية'}
              >
                −
              </button>
              <span
                data-testid="ty-qty-value"
                className="type-sm font-extrabold text-[#F4F3EF] tabular-nums px-2"
              >
                {selectedQty}
              </span>
              <button
                type="button"
                disabled={isUpdatingQty}
                data-testid="ty-qty-plus"
                onClick={() => handleApplyQuantityChange(selectedQty + 1)}
                className="w-9 h-9 min-w-[36px] min-h-[36px] type-body font-extrabold text-[#CEF90B] disabled:opacity-40 flex items-center justify-center cursor-pointer"
                aria-label={isEn ? 'Increase quantity' : 'زيادة الكمية'}
              >
                +
              </button>
            </div>

            {currentPackCount < 3 && (
              <button
                type="button"
                disabled={isUpdatingQty}
                onClick={() => handleApplyQuantityChange(currentPackCount + 1)}
                data-testid="vip-upsell-accept-btn"
                className="min-h-[40px] px-4 rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
              >
                {isUpdatingQty ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>
                    {currentPackCount === 1
                      ? isEn
                        ? 'Upgrade to 2 Packs (595 EGP)'
                        : 'ترقية لعبوتين (595 ج.م)'
                      : isEn
                      ? 'Upgrade to 3 Packs (820 EGP)'
                      : 'ترقية لـ 3 عبوات (820 ج.م)'}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* MAIN 2-COLUMN CLEAN RECEIPT: INVOICE SUMMARY + CUSTOMER INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* PROFESSIONAL INVOICE SUMMARY CARD (6 Cols) */}
          <div
            data-testid="thank-you-receipt-card"
            className="lg:col-span-6 rounded-2xl bg-[#021E26] border border-white/12 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-5 h-5 text-[#CEF90B] shrink-0" />
                <div className="min-w-0">
                  <h2 className="type-h3 font-extrabold text-[#F4F3EF]">
                    {isEn ? 'Official Order Invoice' : 'ملخص الفاتورة الرسمية'}
                  </h2>
                  <div className="type-xs text-[#C2CFD4]">
                    {isEn ? `Date: ${orderDateFormatted}` : `تاريخ الطلب: ${orderDateFormatted}`}
                  </div>
                </div>
              </div>
              <span
                dir="ltr"
                className="px-2.5 py-1 rounded-lg bg-[#01181E] border border-white/10 type-xs font-extrabold text-[#CEF90B] tabular-nums whitespace-nowrap shrink-0"
              >
                {displayOrderId}
              </span>
            </div>

            {/* Unified Product Line Item */}
            <div className="space-y-2.5">
              {itemsSummary.length > 0 ? (
                itemsSummary.map((item, idx) => (
                  <div
                    key={`${item.packageId}-${idx}`}
                    className="p-4 rounded-xl bg-[#01181E] border border-white/10 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="type-sm font-extrabold text-[#F4F3EF]">
                          {isEn
                            ? 'SHAHEEQ V2 — 30-Piece Pack'
                            : 'عبوة شهيق V2 (30 قطعة)'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#CEF90B]/15 border border-[#CEF90B]/35 text-[#CEF90B] type-xs font-extrabold">
                          {isEn ? item.packageNameEn : item.packageNameAr}
                        </span>
                      </div>
                      <div className="type-xs text-[#C2CFD4]">
                        {isEn
                          ? `Quantity: ${item.packsCount} pack(s) • ${item.totalStrips} magnetic tabs + clips & tool`
                          : `الكمية: ${item.packsCount} عبوة • شامل ${item.totalStrips} لاصقة مغناطيسية + المشابك والأداة`}
                      </div>
                    </div>

                    <div className="text-end shrink-0 tabular-nums whitespace-nowrap">
                      <div className="type-sm font-extrabold text-[#CEF90B]">
                        {item.lineSaleTotal} {currencyLabel}
                      </div>
                      {item.lineRegularTotal > item.lineSaleTotal && (
                        <div className="type-xs text-[#C2CFD4]/70 line-through">
                          {item.lineRegularTotal} {currencyLabel}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#01181E] border border-white/10 flex items-start justify-between gap-3">
                  <div>
                    <div className="type-sm font-extrabold text-[#F4F3EF]">
                      {orderFields.product_name}
                    </div>
                    <div className="type-xs text-[#C2CFD4]">
                      {orderFields.product_variant}
                    </div>
                  </div>
                  <div className="type-sm font-extrabold text-[#CEF90B] tabular-nums whitespace-nowrap">
                    {orderFields.product_total} {currencyLabel}
                  </div>
                </div>
              )}
            </div>

            {/* Itemized Financial Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-white/10 type-sm">
              <div className="flex items-center justify-between text-[#C2CFD4]">
                <span>{isEn ? 'Regular Price:' : 'السعر الأصلي قبل الخصم:'}</span>
                <span className="tabular-nums line-through">
                  {priceBeforeDiscount} {currencyLabel}
                </span>
              </div>

              {orderFields.discount_amount > 0 && (
                <div className="flex items-center justify-between text-[#CEF90B] font-bold">
                  <span>{isEn ? 'Bundle Discount:' : 'قيمة الخصم والتوفير:'}</span>
                  <span data-testid="ty-discount-amount" className="tabular-nums">
                    - {orderFields.discount_amount} {currencyLabel}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#F4F3EF] font-bold">
                <span>
                  {isEn
                    ? `Net Packs Subtotal (${currentPackCount}):`
                    : `صافي سعر العبوات (${currentPackCount} عبوة):`}
                </span>
                <span data-testid="ty-product-total" className="tabular-nums">
                  {orderFields.product_total} {currencyLabel}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#C2CFD4]">
                <span>
                  {isEn
                    ? `Shipping (${orderFields.governorate}):`
                    : `مصاريف الشحن (${orderFields.governorate}):`}
                </span>
                <span
                  data-testid="ty-delivery-fee"
                  className="font-extrabold text-[#CEF90B] tabular-nums"
                >
                  {orderFields.delivery_fee === 0
                    ? isEn
                      ? 'FREE (0 EGP)'
                      : 'شحن مجاني (0 ج.م)'
                    : `${orderFields.delivery_fee} ${currencyLabel}`}
                </span>
              </div>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                <div>
                  <div className="type-body font-extrabold text-[#F4F3EF]">
                    {isEn ? 'Total Due on Delivery:' : 'الإجمالي عند الاستلام:'}
                  </div>
                  <div className="type-xs text-[#C2CFD4]">
                    {isEn
                      ? 'Cash on Delivery • 24h Hold Guarantee'
                      : 'الدفع نقداً عند الاستلام • ضمان الثبات'}
                  </div>
                </div>
                <span
                  data-testid="thank-you-cod-amount"
                  className="text-2xl font-extrabold text-[#CEF90B] tabular-nums"
                >
                  <span data-testid="ty-final-total">
                    {orderFields.cod_amount} {currencyLabel}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* REGISTERED CUSTOMER & DELIVERY DETAILS CARD (6 Cols) */}
          <div
            data-testid="thank-you-customer-card"
            className="lg:col-span-6 rounded-2xl bg-[#021E26] border border-white/12 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#CEF90B]" />
                <div>
                  <h2 className="type-h3 font-extrabold text-[#F4F3EF]">
                    {isEn ? 'Delivery Information' : 'بيانات العميل والتوصيل'}
                  </h2>
                  <div className="type-xs text-[#C2CFD4]">
                    {isEn
                      ? 'Review or edit your shipping details'
                      : 'تأكد من صحة بياناتك لسرعة التوصيل'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditName(orderFields.customer_name);
                  setEditPhone(orderFields.customer_phone);
                  setEditGovernorate(orderFields.governorate);
                  setEditAddress(orderFields.detailed_address);
                  setEditNotes(orderFields.customer_notes);
                  setEditError('');
                  setIsEditingDetails((prev) => !prev);
                }}
                data-testid="toggle-edit-details-btn"
                className="no-print min-h-[40px] px-3.5 rounded-xl bg-[#01181E] hover:bg-[#032833] border border-white/15 text-[#CEF90B] type-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                <span>
                  {isEditingDetails
                    ? isEn
                      ? 'Cancel'
                      : 'إلغاء'
                    : isEn
                    ? 'Edit Info'
                    : 'تعديل البيانات'}
                </span>
              </button>
            </div>

            {editSavedSuccess && (
              <div
                role="status"
                className="no-print p-3 rounded-xl bg-[#032833] border border-[#CEF90B]/40 text-[#CEF90B] type-xs font-extrabold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isEn
                    ? 'Delivery details updated successfully!'
                    : 'تم تحديث بيانات التوصيل بنجاح!'}
                </span>
              </div>
            )}

            {isEditingDetails ? (
              <form onSubmit={handleSaveEditedDetails} className="space-y-3.5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="ty-edit-name"
                      className="block type-xs font-bold text-[#F4F3EF] mb-1"
                    >
                      {isEn ? 'Full Name *' : 'الاسم بالكامل *'}
                    </label>
                    <input
                      id="ty-edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-sm text-[#F4F3EF] focus:border-[#CEF90B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ty-edit-phone"
                      className="block type-xs font-bold text-[#F4F3EF] mb-1"
                    >
                      {isEn ? 'Mobile Number *' : 'رقم الموبايل *'}
                    </label>
                    <input
                      id="ty-edit-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-sm text-[#F4F3EF] tabular-nums focus:border-[#CEF90B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ty-edit-gov"
                    className="block type-xs font-bold text-[#F4F3EF] mb-1"
                  >
                    {isEn ? 'Governorate *' : 'المحافظة *'}
                  </label>
                  <GovernorateSelect
                    id="ty-edit-gov"
                    value={editGovernorate}
                    onChange={(newGov) => setEditGovernorate(newGov)}
                    isEn={isEn}
                    isFreeShipping={orderFields.delivery_fee === 0}
                    cairoFee={INITIAL_BRAND_CONFIG.cairoShippingFee}
                    otherGovFee={INITIAL_BRAND_CONFIG.otherGovShippingFee}
                  />
                </div>

                <div>
                  <label
                    htmlFor="ty-edit-address"
                    className="block type-xs font-bold text-[#F4F3EF] mb-1"
                  >
                    {isEn ? 'Detailed Address *' : 'العنوان بالتفصيل *'}
                  </label>
                  <textarea
                    id="ty-edit-address"
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#01181E] border border-white/20 type-sm text-[#F4F3EF] focus:border-[#CEF90B] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ty-edit-notes"
                    className="block type-xs font-bold text-[#F4F3EF] mb-1"
                  >
                    {isEn ? 'Delivery Notes' : 'ملاحظات التوصيل'}
                  </label>
                  <input
                    id="ty-edit-notes"
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-[#01181E] border border-white/20 type-xs text-[#F4F3EF] focus:border-[#CEF90B] focus:outline-none"
                  />
                </div>

                {editError && (
                  <div role="alert" className="type-xs text-red-400 font-bold">
                    {editError}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    data-testid="save-edited-details-btn"
                    className="min-h-[44px] px-6 rounded-full bg-[#DDFE01] text-[#01181E] type-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSavingEdit ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    )}
                    <span>{isEn ? 'Save Changes' : 'حفظ التعديلات'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#01181E] border border-white/10 space-y-1">
                  <div className="type-xs text-[#C2CFD4] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#CEF90B]" />
                    <span>{isEn ? 'Customer Name' : 'الاسم بالكامل'}</span>
                  </div>
                  <div
                    data-testid="ty-customer-name"
                    className="type-sm font-extrabold text-[#F4F3EF]"
                  >
                    {orderFields.customer_name}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#01181E] border border-white/10 space-y-1 text-start">
                  <div className="type-xs text-[#C2CFD4] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#CEF90B]" />
                    <span>{isEn ? 'Mobile Number' : 'رقم الموبايل'}</span>
                  </div>
                  <div
                    data-testid="ty-customer-phone"
                    className="type-sm font-extrabold text-[#CEF90B] tabular-nums"
                  >
                    <span dir="ltr" className="inline-block">
                      {orderFields.customer_phone}
                      {orderFields.alternate_phone
                        ? ` / ${orderFields.alternate_phone}`
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#01181E] border border-white/10 space-y-1">
                  <div className="type-xs text-[#C2CFD4] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#CEF90B]" />
                    <span>{isEn ? 'Governorate' : 'المحافظة'}</span>
                  </div>
                  <div
                    data-testid="ty-customer-governorate"
                    className="type-sm font-extrabold text-[#F4F3EF]"
                  >
                    {orderFields.governorate}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#01181E] border border-white/10 space-y-1">
                  <div className="type-xs text-[#C2CFD4] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#CEF90B]" />
                    <span>{isEn ? 'Delivery Time' : 'موعد التوصيل المتوقع'}</span>
                  </div>
                  <div className="type-sm font-extrabold text-[#F4F3EF]">
                    {isEn ? 'Within 48 Hours' : 'خلال 48 ساعة لباب البيت'}
                  </div>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#01181E] border border-white/10 space-y-1">
                  <div className="type-xs text-[#C2CFD4] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#CEF90B]" />
                    <span>{isEn ? 'Detailed Address' : 'العنوان بالتفصيل'}</span>
                  </div>
                  <div
                    data-testid="ty-customer-address"
                    className="type-sm font-bold text-[#F4F3EF]"
                  >
                    {orderFields.detailed_address}
                  </div>
                </div>

                {orderFields.customer_notes && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#01181E] border border-white/10 space-y-1">
                    <div className="type-xs text-[#C2CFD4] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#CEF90B]" />
                      <span>{isEn ? 'Notes' : 'ملاحظات التوصيل'}</span>
                    </div>
                    <div
                      data-testid="ty-customer-notes"
                      className="type-xs font-semibold text-[#C2CFD4]"
                    >
                      {orderFields.customer_notes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
