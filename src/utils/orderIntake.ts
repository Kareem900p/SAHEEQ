import {
  INITIAL_BRAND_CONFIG,
  PRODUCT_PACKAGES,
  PRODUCT_VARIANTS,
} from '../data/brandConfig';
import {
  calculateCartSummary,
  calculateShippingByGovernorate,
  type CartItemInput,
} from './ecommerceMath';

export interface OrderCheckoutItemInput {
  packageId: string;
  variantId: string;
  quantity: number;
}

export interface OrderSubmissionRequest {
  submission_id: string;
  checkout_source?: 'direct_modal' | 'cart_drawer';
  customer_name: string;
  customer_phone: string;
  alternate_phone?: string;
  governorate: string;
  city_or_area?: string;
  detailed_address: string;
  delivery_notes?: string;
  customer_notes?: string;
  items: OrderCheckoutItemInput[];
}

export interface AppsScriptOrderFields {
  customer_name: string;
  customer_phone: string;
  alternate_phone: string;
  governorate: string;
  city_or_area: string;
  detailed_address: string;
  delivery_notes: string;
  product_name: string;
  product_variant: string;
  quantity: number;
  customer_notes: string;
  product_total: number;
  delivery_fee: number;
  discount_amount: number;
  customer_total: number;
  payment_method: string;
  cod_amount: number;
}

export interface AppsScriptPostPayload {
  token: string;
  submission_id: string;
  order: AppsScriptOrderFields;
}

export interface AppsScriptResponseData {
  ok?: boolean;
  duplicate?: boolean;
  order_id?: string;
  data_status?: string;
  error?: string;
}

export interface OrderLineSummary {
  packageId: string;
  packageNameAr: string;
  packageNameEn: string;
  variantId: string;
  variantNameAr: string;
  variantNameEn: string;
  quantity: number;
  packsCount: number;
  totalStrips: number;
  unitSalePrice: number;
  unitRegularPrice: number;
  lineSaleTotal: number;
  lineRegularTotal: number;
}

export interface ValidatedOrderResult {
  valid: boolean;
  errorCode?:
    | 'INVALID_SUBMISSION_ID'
    | 'MISSING_NAME'
    | 'INVALID_PHONE'
    | 'MISSING_GOVERNORATE'
    | 'MISSING_ADDRESS'
    | 'EMPTY_ITEMS'
    | 'INVALID_ITEMS';
  errorMessageAr?: string;
  errorMessageEn?: string;
  orderFields?: AppsScriptOrderFields;
  itemsSummary?: OrderLineSummary[];
  totalStrips?: number;
  submissionId?: string;
}

export interface ParsedAppsScriptOutcome {
  success: boolean;
  orderId: string;
  duplicate: boolean;
  dataStatus: string;
  errorMessageAr?: string;
  errorMessageEn?: string;
}

/**
 * Generates a concise, human-readable SHAHEEQ Reference Order ID:
 * Format: SHQ-<today's date DDMM>-<last 3 digits of customer mobile> (e.g. SHQ-2410-678)
 */
export function generateServerOrderId(
  phoneOrSeed: string,
  date: Date = new Date()
): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const ascii = convertArabicDigitsToAscii(String(phoneOrSeed || ''));
  const digitsOnly = ascii.replace(/\D/g, '');

  if (digitsOnly.length >= 3) {
    const last3 = digitsOnly.slice(-3);
    return `SHQ-${dd}${mm}-${last3}`;
  }

  let hash = 2166136261;
  const clean = ascii || 'shaheeq';
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const fallback3 = String((hash >>> 0) % 900 + 100);
  return `SHQ-${dd}${mm}-${fallback3}`;
}

/**
 * Converts Arabic-Indic (٠-٩) and Eastern Arabic-Indic (۰-۹) digits to ASCII (0-9).
 */
export function convertArabicDigitsToAscii(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Normalizes a phone number while strictly keeping it as a string and preserving leading zeros.
 * Handles Egyptian country code prefixes (+20, 0020) and strips formatting characters.
 */
export function normalizePhoneString(rawPhone: unknown): string {
  if (typeof rawPhone !== 'string' && typeof rawPhone !== 'number') {
    return '';
  }
  const str = convertArabicDigitsToAscii(String(rawPhone)).trim();
  if (!str) return '';

  // Remove spaces, dashes, parentheses, dots, and invisible directional marks
  let cleaned = str.replace(/[\s\-().\u200e\u200f\u202a-\u202e]/g, '');

  // Normalize Egyptian international prefix to local 01... format (preserving leading zero)
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (/^201[0125]\d{8}$/.test(cleaned)) {
    cleaned = '0' + cleaned.slice(2);
  } else if (/^1[0125]\d{8}$/.test(cleaned)) {
    // If someone typed 10 digits without the leading zero
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Validates whether a normalized phone string is a valid phone number
 * (accepts standard 11-digit Egyptian mobile 010/011/012/015 or general 8-15 digit phone strings).
 */
export function isValidCustomerPhone(normalizedPhone: string): boolean {
  if (!normalizedPhone || typeof normalizedPhone !== 'string') return false;
  // Standard Egyptian mobile number: 11 digits starting with 010, 011, 012, 015
  if (/^01[0125]\d{8}$/.test(normalizedPhone)) {
    return true;
  }
  // Allow valid landline or regional phone strings (8 to 15 digits starting with 0 or +)
  return /^\+?\d{8,15}$/.test(normalizedPhone);
}

/**
 * Extracts a secondary/alternate Egyptian mobile number from free-text notes if present,
 * returning it as a normalized string with leading zero preserved, or "" if none found.
 */
export function extractAlternatePhoneFromNotes(
  notes: string,
  primaryPhone: string
): string {
  if (!notes) return '';
  const asciiNotes = convertArabicDigitsToAscii(notes);
  const matches = asciiNotes.match(/(?:\+?20|0020|0)?1[0125]\d{8}/g);
  if (!matches) return '';

  for (const rawMatch of matches) {
    const candidate = normalizePhoneString(rawMatch);
    if (candidate && candidate !== primaryPhone && isValidCustomerPhone(candidate)) {
      return candidate;
    }
  }
  return '';
}

/**
 * Validates the incoming order request, normalizes all string fields,
 * and recalculates all financial totals on the server from the canonical package catalog.
 */
export function validateAndBuildOrderFields(
  body: Partial<OrderSubmissionRequest> | null | undefined
): ValidatedOrderResult {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errorCode: 'INVALID_ITEMS',
      errorMessageAr: 'بيانات الطلب غير صالحة. يرجى المحاولة مرة أخرى.',
      errorMessageEn: 'Invalid order data. Please try again.',
    };
  }

  const submissionId =
    typeof body.submission_id === 'string' ? body.submission_id.trim() : '';
  if (
    !submissionId ||
    submissionId.length < 6 ||
    submissionId.length > 128 ||
    !/^[a-zA-Z0-9_-]+$/.test(submissionId)
  ) {
    return {
      valid: false,
      errorCode: 'INVALID_SUBMISSION_ID',
      errorMessageAr: 'معرّف الطلب غير صالح. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
      errorMessageEn: 'Invalid submission identifier. Please refresh and try again.',
    };
  }

  const customerName =
    typeof body.customer_name === 'string'
      ? body.customer_name.trim().replace(/\s+/g, ' ')
      : '';
  if (!customerName || customerName.length < 2 || customerName.length > 150) {
    return {
      valid: false,
      errorCode: 'MISSING_NAME',
      errorMessageAr: 'يرجى كتابة الاسم بالكامل بشكل صحيح.',
      errorMessageEn: 'Please enter your full name.',
    };
  }

  const customerPhone = normalizePhoneString(body.customer_phone);
  if (!isValidCustomerPhone(customerPhone)) {
    return {
      valid: false,
      errorCode: 'INVALID_PHONE',
      errorMessageAr: 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم (مثال: 010xxxxxxxx).',
      errorMessageEn: 'Please enter a valid 11-digit mobile number (e.g. 010xxxxxxxx).',
    };
  }

  const governorate =
    typeof body.governorate === 'string' ? body.governorate.trim() : '';
  if (!governorate || governorate.length > 80) {
    return {
      valid: false,
      errorCode: 'MISSING_GOVERNORATE',
      errorMessageAr: 'يرجى اختيار المحافظة.',
      errorMessageEn: 'Please select your governorate.',
    };
  }

  const detailedAddress =
    typeof body.detailed_address === 'string'
      ? body.detailed_address.trim().replace(/\s+/g, ' ')
      : '';
  if (!detailedAddress || detailedAddress.length < 4 || detailedAddress.length > 500) {
    return {
      valid: false,
      errorCode: 'MISSING_ADDRESS',
      errorMessageAr: 'يرجى كتابة العنوان بالتفصيل (المنطقة، الشارع، رقم العقار).',
      errorMessageEn: 'Please enter your detailed street address.',
    };
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
    return {
      valid: false,
      errorCode: 'EMPTY_ITEMS',
      errorMessageAr: 'السلة فارغة. يرجى اختيار الباقة المطلوبة أولاً.',
      errorMessageEn: 'Your order is empty. Please select a bundle first.',
    };
  }

  const sanitizedItems: CartItemInput[] = [];
  for (const rawItem of body.items) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const packageId = typeof rawItem.packageId === 'string' ? rawItem.packageId.trim() : '';
    const variantId =
      typeof rawItem.variantId === 'string' && rawItem.variantId.trim()
        ? rawItem.variantId.trim()
        : 'black';
    const qty = Number(rawItem.quantity);

    if (!packageId || !Number.isInteger(qty) || qty < 1 || qty > 50) {
      return {
        valid: false,
        errorCode: 'INVALID_ITEMS',
        errorMessageAr: 'الكمية أو الباقة المختارة غير صالحة.',
        errorMessageEn: 'Invalid bundle or quantity selected.',
      };
    }

    const pkgExists = PRODUCT_PACKAGES.some((p) => p.id === packageId && p.inStock);
    const varExists = PRODUCT_VARIANTS.some((v) => v.id === variantId && v.inStock);
    if (!pkgExists || !varExists) {
      return {
        valid: false,
        errorCode: 'INVALID_ITEMS',
        errorMessageAr: 'الباقة المختارة غير متوفرة حالياً.',
        errorMessageEn: 'Selected bundle or variant is unavailable.',
      };
    }

    sanitizedItems.push({
      packageId,
      variantId,
      quantity: qty,
    });
  }

  // Recalculate financials from canonical server-side pricing rules
  const cartSummary = calculateCartSummary(
    sanitizedItems,
    PRODUCT_PACKAGES,
    PRODUCT_VARIANTS,
    INITIAL_BRAND_CONFIG.freeShippingThreshold,
    INITIAL_BRAND_CONFIG.standardShippingFee
  );

  if (cartSummary.items.length === 0 || cartSummary.subtotal <= 0) {
    return {
      valid: false,
      errorCode: 'EMPTY_ITEMS',
      errorMessageAr: 'تعذر حساب إجمالي الطلب. يرجى اختيار الباقة مرة أخرى.',
      errorMessageEn: 'Could not calculate order total. Please re-select your bundle.',
    };
  }

  const productTotal = cartSummary.subtotal;
  const discountAmount = cartSummary.totalSavings;
  const deliveryFee = calculateShippingByGovernorate(
    productTotal,
    governorate,
    INITIAL_BRAND_CONFIG.freeShippingThreshold,
    INITIAL_BRAND_CONFIG.cairoShippingFee,
    INITIAL_BRAND_CONFIG.otherGovShippingFee
  );
  const customerTotal = productTotal + deliveryFee;
  const codAmount = customerTotal;

  // Build product_name & product_variant from actual ordered items
  const productName = `${INITIAL_BRAND_CONFIG.brandNameAr} — ${INITIAL_BRAND_CONFIG.productTitleAr}`;
  const productVariantParts = cartSummary.items.map(
    (item) => `${item.packageNameAr} (${item.variantNameAr})`
  );
  const productVariant = productVariantParts.join(' + ');

  // Total number of 30-strip packs ordered
  const totalQuantity = cartSummary.totalQuantity;

  const rawNotes =
    typeof body.customer_notes === 'string' && body.customer_notes.trim()
      ? body.customer_notes.trim().slice(0, 500)
      : typeof body.delivery_notes === 'string' && body.delivery_notes.trim()
      ? body.delivery_notes.trim().slice(0, 500)
      : '';

  const explicitAltPhone = normalizePhoneString(body.alternate_phone);
  const alternatePhone =
    explicitAltPhone && isValidCustomerPhone(explicitAltPhone)
      ? explicitAltPhone
      : extractAlternatePhoneFromNotes(rawNotes, customerPhone);

  const cityOrArea =
    typeof body.city_or_area === 'string' ? body.city_or_area.trim().slice(0, 120) : '';

  const orderFields: AppsScriptOrderFields = {
    customer_name: customerName,
    customer_phone: customerPhone,
    alternate_phone: alternatePhone,
    governorate,
    city_or_area: cityOrArea,
    detailed_address: detailedAddress,
    delivery_notes: rawNotes,
    product_name: productName,
    product_variant: productVariant,
    quantity: totalQuantity,
    customer_notes: rawNotes,
    product_total: productTotal,
    delivery_fee: deliveryFee,
    discount_amount: discountAmount,
    customer_total: customerTotal,
    payment_method: 'COD',
    cod_amount: codAmount,
  };

  const itemsSummary: OrderLineSummary[] = cartSummary.items.map((item) => ({
    packageId: item.packageId,
    packageNameAr: item.packageNameAr,
    packageNameEn: item.packageNameEn,
    variantId: item.variantId,
    variantNameAr: item.variantNameAr,
    variantNameEn: item.variantNameEn,
    quantity: item.quantity,
    packsCount: item.packsCount,
    totalStrips: item.totalStrips,
    unitSalePrice: item.unitSalePrice,
    unitRegularPrice: item.unitRegularPrice,
    lineSaleTotal: item.lineSaleTotal,
    lineRegularTotal: item.lineRegularTotal,
  }));

  return {
    valid: true,
    submissionId,
    orderFields,
    itemsSummary,
    totalStrips: cartSummary.totalStrips,
  };
}

/**
 * Builds the exact JSON payload expected by the deployed Google Apps Script Web App.
 */
export function buildAppsScriptPayload(
  apiSecret: string,
  submissionId: string,
  orderFields: AppsScriptOrderFields
): AppsScriptPostPayload {
  return {
    token: apiSecret,
    submission_id: submissionId,
    order: orderFields,
  };
}

/**
 * Evaluates the parsed JSON response from Google Apps Script.
 * Only treats the order as persisted when `ok === true` and `order_id` is a non-empty string
 * (or when `ok === true` and `duplicate === true` for an already-persisted submission).
 */
export function evaluateAppsScriptResponse(
  rawResponse: unknown
): ParsedAppsScriptOutcome {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return {
      success: false,
      orderId: '',
      duplicate: false,
      dataStatus: 'INVALID_RESPONSE',
      errorMessageAr: 'تعذر تأكيد تسجيل الطلب حالياً. يرجى المحاولة مرة أخرى.',
      errorMessageEn: 'Could not confirm order registration. Please try again.',
    };
  }

  const data = rawResponse as AppsScriptResponseData;
  const isOk = data.ok === true;
  const isDuplicate = data.duplicate === true;
  const orderId = typeof data.order_id === 'string' ? data.order_id.trim() : '';
  const dataStatus =
    typeof data.data_status === 'string' && data.data_status.trim()
      ? data.data_status.trim()
      : isDuplicate
      ? 'DUPLICATE_IGNORED'
      : 'RECORDED';

  if (isOk && orderId.length > 0) {
    return {
      success: true,
      orderId,
      duplicate: isDuplicate,
      dataStatus,
    };
  }

  if (isOk && isDuplicate) {
    return {
      success: true,
      orderId: orderId || 'CONFIRMED',
      duplicate: true,
      dataStatus,
    };
  }

  return {
    success: false,
    orderId: '',
    duplicate: isDuplicate,
    dataStatus: typeof data.data_status === 'string' ? data.data_status : 'ERROR',
    errorMessageAr:
      'لم يتم تأكيد حفظ الطلب في النظام. لم يتم فقدان بياناتك، يرجى المحاولة مرة أخرى.',
    errorMessageEn:
      'Your order could not be confirmed at this moment. Your details are saved—please try again.',
  };
}
