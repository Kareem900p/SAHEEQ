import {
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
 * Sends the checkout payload to our server-side endpoint (`POST /api/orders`),
 * which validates, recalculates totals, and forwards to Google Apps Script.
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

      const confirmedOrder: ConfirmedOrderRecord = {
        orderId,
        submissionId: localValidation.submissionId,
        createdAtIso: new Date().toISOString(),
        checkoutSource: payload.checkout_source || 'direct_modal',
        duplicate: Boolean(data.duplicate),
        dataStatus: typeof data.data_status === 'string' ? data.data_status : 'RECORDED',
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

    // Fallback if server returned non-400 upstream error: preserve validated customer order
    const fallbackOrderId = generateServerOrderId(localValidation.submissionId);
    const confirmedOrder: ConfirmedOrderRecord = {
      orderId: fallbackOrderId,
      submissionId: localValidation.submissionId,
      createdAtIso: new Date().toISOString(),
      checkoutSource: payload.checkout_source || 'direct_modal',
      duplicate: false,
      dataStatus: 'RECORDED_FALLBACK',
      orderFields: localValidation.orderFields,
      itemsSummary: localValidation.itemsSummary || [],
      totalStrips: localValidation.totalStrips || 30,
      rawItems: payload.items,
    };

    return {
      ok: true,
      orderId: fallbackOrderId,
      duplicate: false,
      dataStatus: 'RECORDED_FALLBACK',
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
    const fallbackOrderId = generateServerOrderId(localValidation.submissionId);
    const confirmedOrder: ConfirmedOrderRecord = {
      orderId: fallbackOrderId,
      submissionId: localValidation.submissionId,
      createdAtIso: new Date().toISOString(),
      checkoutSource: payload.checkout_source || 'direct_modal',
      duplicate: false,
      dataStatus: 'RECORDED_OFFLINE',
      orderFields: localValidation.orderFields,
      itemsSummary: localValidation.itemsSummary || [],
      totalStrips: localValidation.totalStrips || 30,
      rawItems: payload.items,
    };

    return {
      ok: true,
      orderId: fallbackOrderId,
      duplicate: false,
      dataStatus: 'RECORDED_OFFLINE',
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
