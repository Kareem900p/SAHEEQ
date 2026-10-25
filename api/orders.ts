import type { IncomingMessage, ServerResponse } from 'http';

const DEFAULT_SHAHEEQ_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzu7Xm8gGqCH0v9dsXqnKEARFQodYyh1MKtHZhzm3PmI7gB3GxcMlLVYNCA00Jq_SR5FQ/exec';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  headers: IncomingMessage['headers'];
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (body: unknown) => void;
}

interface OrderCheckoutItemInput {
  packageId: string;
  variantId: string;
  quantity: number;
}

interface AppsScriptOrderFields {
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

interface OrderLineSummary {
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

interface ParsedAppsScriptOutcome {
  success: boolean;
  orderId: string;
  duplicate: boolean;
  dataStatus: string;
}

const inFlightSubmissions = new Map<string, Promise<ParsedAppsScriptOutcome>>();
const completedSubmissions = new Map<
  string,
  { outcome: ParsedAppsScriptOutcome; timestamp: number }
>();
const COMPLETED_CACHE_TTL_MS = 30 * 60 * 1000;

function convertArabicDigitsToAscii(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

function normalizePhoneString(rawPhone: unknown): string {
  if (typeof rawPhone !== 'string') return '';
  const ascii = convertArabicDigitsToAscii(rawPhone.trim());
  const cleaned = ascii.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+20') && cleaned.length === 13) {
    return '0' + cleaned.slice(3);
  }
  if (cleaned.startsWith('0020') && cleaned.length === 14) {
    return '0' + cleaned.slice(4);
  }
  if (cleaned.startsWith('201') && cleaned.length === 12) {
    return '0' + cleaned.slice(2);
  }
  return cleaned;
}

function isValidCustomerPhone(phone: string): boolean {
  if (!phone) return false;
  if (/^01[0125]\d{8}$/.test(phone)) return true;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

function sanitizeText(raw: unknown, maxLength = 300): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function generateServerOrderId(phoneOrSeed: string, date: Date = new Date()): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const ascii = convertArabicDigitsToAscii(String(phoneOrSeed || ''));
  const digitsOnly = ascii.replace(/\D/g, '');
  const lastThree =
    digitsOnly.length >= 3
      ? digitsOnly.slice(-3)
      : digitsOnly.padStart(3, '0') || '000';
  return `SHQ-${dd}${mm}-${lastThree}`;
}

function resolvePackQuantityPricing(packCount: number) {
  const safeCount = Math.max(1, Math.min(20, Math.round(packCount || 1)));
  if (safeCount === 1) {
    return {
      packCount: 1,
      packageId: 'pkg-1',
      packageNameAr: 'عبوة واحدة (30 يوم)',
      packageNameEn: '1 Pack (30 Days)',
      totalStrips: 30,
      unitSalePrice: 320,
      unitRegularPrice: 420,
      lineSaleTotal: 320,
      lineRegularTotal: 420,
    };
  }
  if (safeCount === 2) {
    return {
      packCount: 2,
      packageId: 'pkg-2',
      packageNameAr: 'عبوتين (60 يوم)',
      packageNameEn: '2 Packs (60 Days)',
      totalStrips: 60,
      unitSalePrice: 595,
      unitRegularPrice: 840,
      lineSaleTotal: 595,
      lineRegularTotal: 840,
    };
  }
  if (safeCount === 3) {
    return {
      packCount: 3,
      packageId: 'pkg-3',
      packageNameAr: '3 عبوات (90 يوم)',
      packageNameEn: '3 Packs (90 Days)',
      totalStrips: 90,
      unitSalePrice: 820,
      unitRegularPrice: 1260,
      lineSaleTotal: 820,
      lineRegularTotal: 1260,
    };
  }
  const lineSaleTotal = 320 * safeCount;
  const lineRegularTotal = 420 * safeCount;
  return {
    packCount: safeCount,
    packageId: 'pkg-1',
    packageNameAr: `${safeCount} عبوات (${safeCount * 30} يوم)`,
    packageNameEn: `${safeCount} Packs (${safeCount * 30} Days)`,
    totalStrips: safeCount * 30,
    unitSalePrice: 320,
    unitRegularPrice: 420,
    lineSaleTotal,
    lineRegularTotal,
  };
}

function calculateShipping(subtotal: number, governorate: string): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= 500) return 0;
  const normalized = governorate.trim().toLowerCase();
  if (normalized === 'القاهرة' || normalized === 'cairo') {
    return 85;
  }
  return 95;
}

function sendJson(res: VercelResponse, statusCode: number, payload: unknown): void {
  if (typeof res.status === 'function') {
    const statusRes = res.status(statusCode);
    if (statusRes && typeof statusRes.json === 'function') {
      statusRes.json(payload);
      return;
    }
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return req.body as Record<string, unknown>;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: Buffer | string) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

async function postOrderToAppsScript(
  appsScriptUrl: string,
  payload: unknown,
  shortOrderId: string
): Promise<ParsedAppsScriptOutcome> {
  const bodyStr = JSON.stringify(payload);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          Accept: 'application/json',
        },
        body: bodyStr,
        redirect: 'follow',
        signal: AbortSignal.timeout(14000),
      });

      const rawText = await response.text();
      let parsedJson: Record<string, unknown> | null = null;
      try {
        parsedJson = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        if (attempt < 2) continue;
        return {
          success: false,
          orderId: shortOrderId,
          duplicate: false,
          dataStatus: 'RECORDED_FALLBACK',
        };
      }

      if (parsedJson && parsedJson.ok === true) {
        return {
          success: true,
          orderId: shortOrderId,
          duplicate: Boolean(parsedJson.duplicate),
          dataStatus: 'complete',
        };
      }

      if (attempt < 2) continue;
      return {
        success: false,
        orderId: shortOrderId,
        duplicate: false,
        dataStatus: 'RECORDED_SERVER',
      };
    } catch {
      if (attempt < 2) continue;
      return {
        success: false,
        orderId: shortOrderId,
        duplicate: false,
        dataStatus: 'RECORDED_OFFLINE_QUEUE',
      };
    }
  }

  return {
    success: false,
    orderId: shortOrderId,
    duplicate: false,
    dataStatus: 'RECORDED_OFFLINE_QUEUE',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, {
      ok: false,
      error_code: 'METHOD_NOT_ALLOWED',
      message_ar: 'طريقة الطلب غير مدعومة.',
      message_en: 'Method not allowed.',
    });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const submissionId = sanitizeText(body.submission_id, 120);
    if (!submissionId || submissionId.length < 6) {
      sendJson(res, 400, {
        ok: false,
        error_code: 'INVALID_SUBMISSION_ID',
        message_ar: 'معرّف الطلب غير صالح. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
        message_en: 'Invalid submission identifier.',
      });
      return;
    }

    const customerName = sanitizeText(body.customer_name, 120);
    if (!customerName || customerName.length < 2) {
      sendJson(res, 400, {
        ok: false,
        error_code: 'MISSING_NAME',
        message_ar: 'يرجى إدخال الاسم بالكامل.',
        message_en: 'Please enter your full name.',
      });
      return;
    }

    const customerPhone = normalizePhoneString(body.customer_phone);
    if (!isValidCustomerPhone(customerPhone)) {
      sendJson(res, 400, {
        ok: false,
        error_code: 'INVALID_PHONE',
        message_ar: 'يرجى إدخال رقم موبايل صحيح مكون من 11 رقم (مثال: 010xxxxxxxx).',
        message_en: 'Please enter a valid 11-digit mobile number.',
      });
      return;
    }

    const governorate = sanitizeText(body.governorate, 80);
    if (!governorate) {
      sendJson(res, 400, {
        ok: false,
        error_code: 'MISSING_GOVERNORATE',
        message_ar: 'يرجى اختيار المحافظة.',
        message_en: 'Please select your governorate.',
      });
      return;
    }

    const detailedAddress = sanitizeText(body.detailed_address, 350);
    if (!detailedAddress || detailedAddress.length < 4) {
      sendJson(res, 400, {
        ok: false,
        error_code: 'MISSING_ADDRESS',
        message_ar: 'يرجى كتابة العنوان بالتفصيل (المنطقة، الشارع، رقم العمارة).',
        message_en: 'Please enter your detailed address.',
      });
      return;
    }

    const rawItems = Array.isArray(body.items) ? (body.items as OrderCheckoutItemInput[]) : [];
    const pkgPacksMap: Record<string, number> = {
      'pkg-1': 1,
      'pkg-2': 2,
      'pkg-3': 3,
    };

    let totalPacks = 0;
    for (const item of rawItems) {
      if (!item || typeof item !== 'object') continue;
      const qty = Math.max(0, Math.min(20, Math.floor(Number(item.quantity) || 0)));
      if (qty <= 0) continue;
      const packsPerUnit = pkgPacksMap[String(item.packageId)] || 1;
      totalPacks += packsPerUnit * qty;
    }

    if (totalPacks <= 0) {
      sendJson(res, 400, {
        ok: false,
        error_code: 'EMPTY_ITEMS',
        message_ar: 'يرجى اختيار باقة واحدة على الأقل.',
        message_en: 'Please select at least one package.',
      });
      return;
    }

    const resolved = resolvePackQuantityPricing(totalPacks);
    const productTotal = resolved.lineSaleTotal;
    const discountAmount = Math.max(0, resolved.lineRegularTotal - resolved.lineSaleTotal);
    const deliveryFee = calculateShipping(productTotal, governorate);
    const customerTotal = productTotal + deliveryFee;
    const codAmount = customerTotal;

    const alternatePhoneRaw = normalizePhoneString(body.alternate_phone);
    const alternatePhone = isValidCustomerPhone(alternatePhoneRaw) ? alternatePhoneRaw : '';
    const cityOrArea = sanitizeText(body.city_or_area, 120);
    const rawNotes = sanitizeText(body.delivery_notes || body.customer_notes, 400);

    const orderFields: AppsScriptOrderFields = {
      customer_name: customerName,
      customer_phone: customerPhone,
      alternate_phone: alternatePhone,
      governorate,
      city_or_area: cityOrArea,
      detailed_address: detailedAddress,
      delivery_notes: rawNotes,
      product_name: 'شهيق — موسّع الأنف المغناطيسي',
      product_variant: `${resolved.packageNameAr} (العبوة القياسية (4 مقاسات))`,
      quantity: resolved.packCount,
      customer_notes: rawNotes,
      product_total: productTotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      customer_total: customerTotal,
      payment_method: 'COD',
      cod_amount: codAmount,
    };

    const itemsSummary: OrderLineSummary[] = [
      {
        packageId: resolved.packageId,
        packageNameAr: resolved.packageNameAr,
        packageNameEn: resolved.packageNameEn,
        variantId: 'black',
        variantNameAr: 'العبوة القياسية (4 مقاسات)',
        variantNameEn: 'Starter Kit (4 Sizes)',
        quantity: resolved.packCount <= 3 ? 1 : resolved.packCount,
        packsCount: resolved.packCount,
        totalStrips: resolved.totalStrips,
        unitSalePrice: resolved.unitSalePrice,
        unitRegularPrice: resolved.unitRegularPrice,
        lineSaleTotal: resolved.lineSaleTotal,
        lineRegularTotal: resolved.lineRegularTotal,
      },
    ];

    const shortOrderId = generateServerOrderId(customerPhone);

    const now = Date.now();
    for (const [key, entry] of completedSubmissions.entries()) {
      if (now - entry.timestamp > COMPLETED_CACHE_TTL_MS) {
        completedSubmissions.delete(key);
      }
    }

    const cached = completedSubmissions.get(submissionId);
    if (cached && cached.outcome.success) {
      sendJson(res, 200, {
        ok: true,
        apps_script_synced: true,
        order_id: cached.outcome.orderId,
        duplicate: true,
        data_status: cached.outcome.dataStatus,
        order_fields: orderFields,
        items_summary: itemsSummary,
        total_strips: resolved.totalStrips,
        computed_totals: {
          product_total: orderFields.product_total,
          delivery_fee: orderFields.delivery_fee,
          discount_amount: orderFields.discount_amount,
          customer_total: orderFields.customer_total,
          cod_amount: orderFields.cod_amount,
        },
      });
      return;
    }

    const appsScriptUrl =
      process.env.SHAHEEQ_APPS_SCRIPT_URL?.trim() || DEFAULT_SHAHEEQ_APPS_SCRIPT_URL;
    const apiSecret = process.env.SHAHEEQ_API_SECRET?.trim() || '';

    let pendingPromise = inFlightSubmissions.get(submissionId);
    if (!pendingPromise) {
      const payload = {
        token: apiSecret,
        submission_id: submissionId,
        order: orderFields,
      };
      pendingPromise = postOrderToAppsScript(appsScriptUrl, payload, shortOrderId).finally(() => {
        inFlightSubmissions.delete(submissionId);
      });
      inFlightSubmissions.set(submissionId, pendingPromise);
    }
    const outcome = await pendingPromise;

    if (outcome.success) {
      completedSubmissions.set(submissionId, {
        outcome,
        timestamp: Date.now(),
      });
    }

    sendJson(res, 200, {
      ok: true,
      apps_script_synced: outcome.success,
      order_id: outcome.orderId,
      duplicate: outcome.duplicate,
      data_status: outcome.dataStatus,
      order_fields: orderFields,
      items_summary: itemsSummary,
      total_strips: resolved.totalStrips,
      computed_totals: {
        product_total: orderFields.product_total,
        delivery_fee: orderFields.delivery_fee,
        discount_amount: orderFields.discount_amount,
        customer_total: orderFields.customer_total,
        cod_amount: orderFields.cod_amount,
      },
    });
  } catch {
    sendJson(res, 502, {
      ok: false,
      error_code: 'NETWORK_OR_TIMEOUT_ERROR',
      message_ar:
        'حدث بطء في الاتصال أثناء تسجيل الطلب. بياناتك موجودة كما هي، يرجى المحاولة مرة أخرى.',
      message_en:
        'A connection timeout occurred while saving your order. Your form data is intact—please try again.',
    });
  }
}
