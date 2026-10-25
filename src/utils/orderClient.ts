import {
  DEFAULT_SHAHEEQ_APPS_SCRIPT_URL,
  validateAndBuildOrderFields,
  generateServerOrderId,
  type OrderSubmissionRequest,
  type AppsScriptOrderFields,
  type OrderLineSummary,
} from './orderIntake';

export interface ConfirmedOrderRecord {
  orderId: string;
  submissionId: string;
  createdAtIso: string;
  checkoutSource: 'direct_modal' | 'cart_drawer';
  duplicate: boolean;
  dataStatus: string;
  orderFields: AppsScriptOrderFields;
  itemsSummary: OrderLineSummary[];
  totalStrips: number;
  rawItems: Array<{
    packageId: string;
    variantId: string;
    quantity: number;
  }>;
}

export interface SubmitOrderClientResult {
  ok: boolean;
  orderId: string;
  duplicate: boolean;
  dataStatus: string;
  messageAr?: string;
  messageEn?: string;
  confirmedOrder?: ConfirmedOrderRecord;
  computedTotals?: {
    product_total: number;
    delivery_fee: number;
    discount_amount: number;
    customer_total: number;
    cod_amount: number;
  };
}

/**
 * Generates a unique idempotency key (`submission_id`) for a checkout attempt.
 * Reused on retries of the same failed submission; regenerated only for a new order.
 */
export function generateSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `shq_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  const randomPart = Math.random().toString(36).slice(2, 12);
  const timePart = Date.now().toString(36);
  return `shq_${timePart}_${randomPart}`;
}

/**
 * Direct fallback sync to the SHAHEEQ Google Apps Script Web App using CORS-safe text/plain
 * and the exact same `submission_id` (deduplicated by Apps Script) if `/api/orders` did not
 * already confirm upstream persistence.
 */
async function syncDirectlyToAppsScript(
  submissionId: string,
  orderFields: AppsScriptOrderFields
): Promise<boolean> {
  try {
    const response = await fetch(DEFAULT_SHAHEEQ_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        submission_id: submissionId,
        order: orderFields,
      }),
      redirect: 'follow',
    });

    const data = await response.json().catch(() => null);
    return Boolean(data && data.ok === true);
  } catch {
    return false;
  }
}

/**
 * Sends the checkout payload to our server-side endpoint (`POST /api/orders`),
 * which validates, recalculates totals, and forwards to Google Apps Script.
 * If the server route is unreachable or did not confirm upstream Google Sheets sync,
 * automatically performs a direct deduplicated sync to the Apps Script endpoint.
 */
export async function submitOrderToServer(
  payload: OrderSubmissionRequest
): Promise<SubmitOrderClientResult> {
  // Pre-validate locally so invalid inputs are caught immediately with clear messages
  const localValidation = validateAndBuildOrderFields(payload);
  if (!localValidation.valid || !localValidation.orderFields || !localValidation.submissionId) {
    return {
      ok: false,
      orderId: '',
      duplicate: false,
      dataStatus: localValidation.errorCode || 'VALIDATION_ERROR',
      messageAr:
        localValidation.errorMessageAr || 'يرجى مراجعة البيانات المطلوبة والمحاولة مرة أخرى.',
      messageEn:
        localValidation.errorMessageEn || 'Please check your order details and try again.',
    };
  }

  const shortOrderId = generateServerOrderId(localValidation.orderFields.customer_phone);

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.status === 400 && data) {
      return {
        ok: false,
        orderId: '',
        duplicate: false,
        dataStatus: data.error_code || 'VALIDATION_ERROR',
        messageAr:
          data.message_ar || 'يرجى مراجعة البيانات المطلوبة والمحاولة مرة أخرى.',
        messageEn:
          data.message_en || 'Please check your order details and try again.',
      };
    }

    if (
      response.ok &&
      data &&
      data.ok === true &&
      typeof data.order_id === 'string' &&
      data.order_id.trim().length > 0
    ) {
      const orderId = data.order_id.trim();
      const orderFields: AppsScriptOrderFields =
        data.order_fields || localValidation.orderFields;
      const itemsSummary: OrderLineSummary[] =
        data.items_summary || localValidation.itemsSummary || [];
      const totalStrips: number =
        typeof data.total_strips === 'number'
          ? data.total_strips
          : localValidation.totalStrips || 30;

      // If server did not confirm upstream Google Sheets sync, sync directly with the same submission_id
      let isSynced = data.apps_script_synced === true || data.data_status === 'complete';
      if (!isSynced) {
        isSynced = await syncDirectlyToAppsScript(localValidation.submissionId, orderFields);
      }

      const confirmedOrder: ConfirmedOrderRecord = {
        orderId,
        submissionId: localValidation.submissionId,
        createdAtIso: new Date().toISOString(),
        checkoutSource: payload.checkout_source || 'direct_modal',
        duplicate: Boolean(data.duplicate),
        dataStatus: isSynced ? 'complete' : typeof data.data_status === 'string' ? data.data_status : 'RECORDED',
        orderFields,
        itemsSummary,
        totalStrips,
        rawItems: payload.items,
      };

      return {
        ok: true,
        orderId,
        duplicate: Boolean(data.duplicate),
        dataStatus: confirmedOrder.dataStatus,
        confirmedOrder,
        computedTotals: data.computed_totals || {
          product_total: orderFields.product_total,
          delivery_fee: orderFields.delivery_fee,
          discount_amount: orderFields.discount_amount,
          customer_total: orderFields.customer_total,
          cod_amount: orderFields.cod_amount,
        },
      };
    }

    // If /api/orders returned non-200 (e.g., 404/500 on static hosting), send directly to Apps Script
    const syncedDirect = await syncDirectlyToAppsScript(
      localValidation.submissionId,
      localValidation.orderFields
    );

    const confirmedOrder: ConfirmedOrderRecord = {
      orderId: shortOrderId,
      submissionId: localValidation.submissionId,
      createdAtIso: new Date().toISOString(),
      checkoutSource: payload.checkout_source || 'direct_modal',
      duplicate: false,
      dataStatus: syncedDirect ? 'complete' : 'RECORDED_FALLBACK',
      orderFields: localValidation.orderFields,
      itemsSummary: localValidation.itemsSummary || [],
      totalStrips: localValidation.totalStrips || 30,
      rawItems: payload.items,
    };

    return {
      ok: true,
      orderId: shortOrderId,
      duplicate: false,
      dataStatus: confirmedOrder.dataStatus,
      confirmedOrder,
      computedTotals: {
        product_total: localValidation.orderFields.product_total,
        delivery_fee: localValidation.orderFields.delivery_fee,
        discount_amount: localValidation.orderFields.discount_amount,
        customer_total: localValidation.orderFields.customer_total,
        cod_amount: localValidation.orderFields.cod_amount,
      },
    };
  } catch {
    // Network error reaching /api/orders -> send directly to Google Apps Script
    const syncedDirect = await syncDirectlyToAppsScript(
      localValidation.submissionId,
      localValidation.orderFields
    );

    const confirmedOrder: ConfirmedOrderRecord = {
      orderId: shortOrderId,
      submissionId: localValidation.submissionId,
      createdAtIso: new Date().toISOString(),
      checkoutSource: payload.checkout_source || 'direct_modal',
      duplicate: false,
      dataStatus: syncedDirect ? 'complete' : 'RECORDED_OFFLINE',
      orderFields: localValidation.orderFields,
      itemsSummary: localValidation.itemsSummary || [],
      totalStrips: localValidation.totalStrips || 30,
      rawItems: payload.items,
    };

    return {
      ok: true,
      orderId: shortOrderId,
      duplicate: false,
      dataStatus: confirmedOrder.dataStatus,
      confirmedOrder,
      computedTotals: {
        product_total: localValidation.orderFields.product_total,
        delivery_fee: localValidation.orderFields.delivery_fee,
        discount_amount: localValidation.orderFields.discount_amount,
        customer_total: localValidation.orderFields.customer_total,
        cod_amount: localValidation.orderFields.cod_amount,
      },
    };
  }
}
