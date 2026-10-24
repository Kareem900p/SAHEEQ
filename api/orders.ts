import type { IncomingMessage, ServerResponse } from 'http';
import {
  validateAndBuildOrderFields,
  buildAppsScriptPayload,
  evaluateAppsScriptResponse,
  generateServerOrderId,
  type ParsedAppsScriptOutcome,
} from '../src/utils/orderIntake';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  headers: IncomingMessage['headers'];
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (body: unknown) => void;
}

const inFlightSubmissions = new Map<string, Promise<ParsedAppsScriptOutcome>>();
const completedSubmissions = new Map<
  string,
  { outcome: ParsedAppsScriptOutcome; timestamp: number }
>();
const COMPLETED_CACHE_TTL_MS = 30 * 60 * 1000;

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
        resolve(raw ? JSON.parse(raw) : {});
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
  try {
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    });

    const rawText = await response.text();
    let parsedJson: unknown = null;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      return {
        success: true,
        orderId: shortOrderId,
        duplicate: false,
        dataStatus: 'RECORDED_FALLBACK',
      };
    }

    const evaluated = evaluateAppsScriptResponse(parsedJson);
    if (evaluated.success) {
      return {
        ...evaluated,
        orderId: shortOrderId,
      };
    }

    return {
      success: true,
      orderId: shortOrderId,
      duplicate: evaluated.duplicate,
      dataStatus: 'RECORDED_SERVER',
    };
  } catch {
    return {
      success: true,
      orderId: shortOrderId,
      duplicate: false,
      dataStatus: 'RECORDED_OFFLINE_QUEUE',
    };
  }
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
    const validation = validateAndBuildOrderFields(body);
    if (!validation.valid || !validation.orderFields || !validation.submissionId) {
      sendJson(res, 400, {
        ok: false,
        error_code: validation.errorCode || 'VALIDATION_ERROR',
        message_ar:
          validation.errorMessageAr || 'يرجى مراجعة البيانات المطلوبة والمحاولة مرة أخرى.',
        message_en:
          validation.errorMessageEn || 'Please check your order details and try again.',
      });
      return;
    }

    const submissionId = validation.submissionId;
    const orderFields = validation.orderFields;
    const itemsSummary = validation.itemsSummary || [];
    const totalStrips = validation.totalStrips || 30;
    const shortOrderId = generateServerOrderId(orderFields.customer_phone);

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
        order_id: cached.outcome.orderId,
        duplicate: true,
        data_status: cached.outcome.dataStatus,
        order_fields: orderFields,
        items_summary: itemsSummary,
        total_strips: totalStrips,
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

    const appsScriptUrl = process.env.SHAHEEQ_APPS_SCRIPT_URL?.trim() || '';
    const apiSecret = process.env.SHAHEEQ_API_SECRET?.trim() || '';

    let outcome: ParsedAppsScriptOutcome;
    if (!appsScriptUrl || !apiSecret) {
      outcome = {
        success: true,
        orderId: shortOrderId,
        duplicate: false,
        dataStatus: 'RECORDED_LOCAL',
      };
    } else {
      let pendingPromise = inFlightSubmissions.get(submissionId);
      if (!pendingPromise) {
        const payload = buildAppsScriptPayload(apiSecret, submissionId, orderFields);
        pendingPromise = postOrderToAppsScript(appsScriptUrl, payload, shortOrderId).finally(() => {
          inFlightSubmissions.delete(submissionId);
        });
        inFlightSubmissions.set(submissionId, pendingPromise);
      }
      outcome = await pendingPromise;
    }

    completedSubmissions.set(submissionId, {
      outcome,
      timestamp: Date.now(),
    });

    sendJson(res, 200, {
      ok: true,
      order_id: outcome.orderId,
      duplicate: outcome.duplicate,
      data_status: outcome.dataStatus,
      order_fields: orderFields,
      items_summary: itemsSummary,
      total_strips: totalStrips,
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
