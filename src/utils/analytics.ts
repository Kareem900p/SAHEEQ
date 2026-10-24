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
  | 'newsletter_signup'
  | 'faq_expand'
  | 'comparison_cta_click';

export interface ConversionEventRecord {
  id: string;
  event: ConversionEventName;
  timestamp: string;
  payload: Record<string, string | number | boolean | undefined>;
}

const eventHistory: ConversionEventRecord[] = [];
const listeners: Array<(events: ConversionEventRecord[]) => void> = [];

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
