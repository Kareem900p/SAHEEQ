/**
 * طبقة تتبع أحداث التحويل والتحليلات (Conversion & Analytics Event Layer)
 * تطبق القسم 25 من المتطلبات دون إرسال أي بيانات شخصية حساسة (No PII).
 */

export type ConversionEventName =
  | 'view_item'
  | 'select_item'
  | 'select_variant'
  | 'select_package'
  | 'change_quantity'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'newsletter_signup'
  | 'faq_expand'
  | 'comparison_cta_click'
  | 'how_it_works_cta_click';

export interface ConversionEventRecord {
  id: string;
  event: ConversionEventName;
  timestamp: string;
  payload: Record<string, string | number | boolean | undefined>;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = '2496006210888588';

const eventHistory: ConversionEventRecord[] = [];
const listeners: Array<(events: ConversionEventRecord[]) => void> = [];

function dispatchToMetaPixel(
  event: ConversionEventName,
  payload: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  try {
    switch (event) {
      case 'view_item':
        window.fbq('track', 'ViewContent', {
          content_name: 'شهيق | SHAHEEQ — موسّع الأنف المغناطيسي',
          content_ids: [String(payload.packageId || 'pkg-1')],
          content_type: 'product',
          value: Number(payload.salePrice) || 320,
          currency: 'EGP',
        });
        break;

      case 'add_to_cart':
        window.fbq('track', 'AddToCart', {
          content_name: 'شهيق | SHAHEEQ — موسّع الأنف المغناطيسي',
          content_ids: [String(payload.packageId || 'pkg-1')],
          content_type: 'product',
          value: Number(payload.lineTotal) || 320,
          currency: 'EGP',
          num_items: Number(payload.quantity) || 1,
        });
        break;

      case 'begin_checkout':
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'شهيق | SHAHEEQ — موسّع الأنف المغناطيسي',
          content_type: 'product',
          value: Number(payload.subtotal || payload.value || payload.salePrice) || 320,
          currency: 'EGP',
          num_items: Number(payload.quantity || payload.totalQuantity) || 1,
        });
        break;

      case 'purchase':
        window.fbq('track', 'Purchase', {
          content_name: 'شهيق | SHAHEEQ — موسّع الأنف المغناطيسي',
          content_type: 'product',
          value: Number(payload.value) || 320,
          currency: 'EGP',
          num_items: Number(payload.quantity) || 1,
          order_id: payload.orderId ? String(payload.orderId) : undefined,
        });
        break;

      case 'newsletter_signup':
        window.fbq('track', 'Lead', {
          content_name: 'SHAHEEQ VIP Newsletter',
        });
        break;

      default:
        window.fbq('trackCustom', event, payload);
        break;
    }
  } catch {
    // Prevent ad-blockers or third-party script restrictions from interrupting checkout
  }
}

export function trackConversionEvent(
  event: ConversionEventName,
  payload: Record<string, string | number | boolean | undefined> = {}
): void {
  const record: ConversionEventRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event,
    timestamp: new Date().toISOString(),
    payload,
  };

  eventHistory.unshift(record);
  if (eventHistory.length > 50) {
    eventHistory.pop();
  }

  dispatchToMetaPixel(event, payload);

  for (const listener of listeners) {
    listener([...eventHistory]);
  }
}

export function getTrackedEvents(): ConversionEventRecord[] {
  return [...eventHistory];
}

export function subscribeToTrackedEvents(
  callback: (events: ConversionEventRecord[]) => void
): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
