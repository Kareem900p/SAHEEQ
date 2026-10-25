import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_SHAHEEQ_APPS_SCRIPT_URL,
  validateAndBuildOrderFields,
  buildAppsScriptPayload,
  evaluateAppsScriptResponse,
  generateServerOrderId,
  type ParsedAppsScriptOutcome,
} from './src/utils/orderIntake';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Per-IP rate limiting window for order creation (protects Apps Script from abuse)
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 30;
const ipRequestTimestamps = new Map<string, number[]>();

// Track in-flight and recently confirmed submission_ids in memory to prevent concurrent duplicate hits
const inFlightSubmissions = new Map<string, Promise<ParsedAppsScriptOutcome>>();
const completedSubmissions = new Map<
  string,
  { outcome: ParsedAppsScriptOutcome; timestamp: number }
>();
const COMPLETED_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(clientIp) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestTimestamps.set(clientIp, recent);
    return true;
  }
  recent.push(now);
  ipRequestTimestamps.set(clientIp, recent);
  return false;
}

function pruneCompletedCache(): void {
  const now = Date.now();
  for (const [key, entry] of completedSubmissions.entries()) {
    if (now - entry.timestamp > COMPLETED_CACHE_TTL_MS) {
      completedSubmissions.delete(key);
    }
  }
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
      let parsedJson: unknown = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        if (attempt < 2) continue;
        return {
          success: false,
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
          dataStatus: 'complete',
        };
      }

      if (attempt < 2) continue;
      return {
        success: false,
        orderId: shortOrderId,
        duplicate: evaluated.duplicate,
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  // Order creation endpoint — strictly write-only, no read/list/delete/export endpoints
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';

      if (isRateLimited(clientIp)) {
        res.status(429).json({
          ok: false,
          error_code: 'RATE_LIMITED',
          message_ar: 'تم إرسال طلبات كثيرة خلال وقت قصير. يرجى الانتظار دقيقة والمحاولة مرة أخرى.',
          message_en: 'Too many requests in a short time. Please wait a moment and try again.',
        });
        return;
      }

      const validation = validateAndBuildOrderFields(req.body);
      if (!validation.valid || !validation.orderFields || !validation.submissionId) {
        res.status(400).json({
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

      pruneCompletedCache();

      // Check if this exact submission_id was already confirmed recently in Google Sheets
      const cached = completedSubmissions.get(submissionId);
      if (cached && cached.outcome.success) {
        res.status(200).json({
          ok: true,
          apps_script_synced: true,
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

      // Always resolve the Google Apps Script Web App URL (env var or configured SHAHEEQ endpoint)
      const appsScriptUrl =
        process.env.SHAHEEQ_APPS_SCRIPT_URL?.trim() || DEFAULT_SHAHEEQ_APPS_SCRIPT_URL;
      const apiSecret = process.env.SHAHEEQ_API_SECRET?.trim() || '';

      // Deduplicate concurrent identical requests while in-flight
      let pendingPromise = inFlightSubmissions.get(submissionId);
      if (!pendingPromise) {
        const payload = buildAppsScriptPayload(apiSecret, submissionId, orderFields);
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

      res.status(200).json({
        ok: true,
        apps_script_synced: outcome.success,
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
      // Never leak stack traces, URLs, or secrets
      res.status(502).json({
        ok: false,
        error_code: 'NETWORK_OR_TIMEOUT_ERROR',
        message_ar:
          'حدث بطء في الاتصال أثناء تسجيل الطلب. بياناتك موجودة كما هي، يرجى المحاولة مرة أخرى.',
        message_en:
          'A connection timeout occurred while saving your order. Your form data is intact—please try again.',
      });
    }
  });

  // Catch-all for any unimplemented /api/* routes so they return clean JSON 404
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({
      ok: false,
      error_code: 'NOT_FOUND',
      message_ar: 'الخدمة غير موجودة.',
      message_en: 'Endpoint not found.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SHAHEEQ server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
