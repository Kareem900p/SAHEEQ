import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhoneString,
  isValidCustomerPhone,
  extractAlternatePhoneFromNotes,
  validateAndBuildOrderFields,
  buildAppsScriptPayload,
  evaluateAppsScriptResponse,
  generateServerOrderId,
} from './orderIntake';

test('normalizePhoneString preserves leading zeros as string and converts Arabic digits', () => {
  assert.equal(normalizePhoneString('01012345678'), '01012345678');
  assert.equal(typeof normalizePhoneString('01012345678'), 'string');
  assert.equal(normalizePhoneString('٠١٠١٢٣٤٥٦٧٨'), '01012345678');
  assert.equal(normalizePhoneString('+20 112-345-6789'), '01123456789');
  assert.equal(normalizePhoneString('00201234567890'), '01234567890');
  assert.equal(normalizePhoneString('1551234567'), '01551234567');
});

test('isValidCustomerPhone accepts valid Egyptian numbers and rejects invalid strings', () => {
  assert.equal(isValidCustomerPhone('01012345678'), true);
  assert.equal(isValidCustomerPhone('01198765432'), true);
  assert.equal(isValidCustomerPhone('01234567890'), true);
  assert.equal(isValidCustomerPhone('01555555555'), true);
  assert.equal(isValidCustomerPhone('12345'), false);
  assert.equal(isValidCustomerPhone('abc'), false);
  assert.equal(isValidCustomerPhone(''), false);
});

test('extractAlternatePhoneFromNotes extracts secondary phone if different from primary', () => {
  const primary = '01011112222';
  const noteWithAlt = 'يرجى الاتصال بعد الظهر، رقم بديل ٠١٢٣٣٣٣٤٤٤٤';
  assert.equal(extractAlternatePhoneFromNotes(noteWithAlt, primary), '01233334444');

  const noteWithSame = 'رقمي هو 01011112222';
  assert.equal(extractAlternatePhoneFromNotes(noteWithSame, primary), '');
});

test('validateAndBuildOrderFields computes exact server-side financials for 1-Pack in Cairo (320 + 85 = 405 EGP, discount 100)', () => {
  const res = validateAndBuildOrderFields({
    submission_id: 'sub_test_123456',
    customer_name: 'أحمد محمد علي',
    customer_phone: '٠١٠١٢٣٤٥٦٧٨',
    governorate: 'القاهرة',
    detailed_address: 'مدينة نصر، شارع عباس العقاد، عمارة ١٥',
    customer_notes: 'التوصيل مسائاً - رقم تاني 01122334455',
    items: [{ packageId: 'pkg-1', variantId: 'black', quantity: 1 }],
  });

  assert.equal(res.valid, true);
  assert.ok(res.orderFields);
  assert.equal(res.orderFields.customer_name, 'أحمد محمد علي');
  assert.equal(res.orderFields.customer_phone, '01012345678');
  assert.equal(res.orderFields.alternate_phone, '01122334455');
  assert.equal(res.orderFields.governorate, 'القاهرة');
  assert.equal(res.orderFields.detailed_address, 'مدينة نصر، شارع عباس العقاد، عمارة ١٥');
  assert.equal(res.orderFields.product_name, 'شهيق — موسّع الأنف المغناطيسي');
  assert.equal(
    res.orderFields.product_variant,
    'عبوة واحدة (30 يوم) (العبوة القياسية (4 مقاسات))'
  );
  assert.equal(res.orderFields.quantity, 1);
  assert.equal(res.orderFields.product_total, 320);
  assert.equal(res.orderFields.delivery_fee, 85);
  assert.equal(res.orderFields.discount_amount, 100);
  assert.equal(res.orderFields.customer_total, 405);
  assert.equal(res.orderFields.payment_method, 'COD');
  assert.equal(res.orderFields.cod_amount, 405);
  assert.equal(res.totalStrips, 30);
  assert.equal(res.itemsSummary?.length, 1);
  assert.equal(res.itemsSummary?.[0].packageId, 'pkg-1');
});

test('validateAndBuildOrderFields computes free shipping for 2-Pack Best Offer in Alexandria (595 + 0 = 595 EGP, discount 245)', () => {
  const res = validateAndBuildOrderFields({
    submission_id: 'sub_test_654321',
    customer_name: 'كريم محمود',
    customer_phone: '01234567890',
    governorate: 'الإسكندرية',
    detailed_address: 'سموحة، شارع فوزي معاذ، برج السلام',
    items: [{ packageId: 'pkg-2', variantId: 'black', quantity: 1 }],
  });

  assert.equal(res.valid, true);
  assert.ok(res.orderFields);
  assert.equal(res.orderFields.product_total, 595);
  assert.equal(res.orderFields.delivery_fee, 0);
  assert.equal(res.orderFields.discount_amount, 245);
  assert.equal(res.orderFields.customer_total, 595);
  assert.equal(res.orderFields.cod_amount, 595);
  assert.equal(res.totalStrips, 60);
});

test('validateAndBuildOrderFields rejects missing required fields cleanly', () => {
  const missingPhone = validateAndBuildOrderFields({
    submission_id: 'sub_test_999999',
    customer_name: 'أحمد',
    customer_phone: '123',
    governorate: 'القاهرة',
    detailed_address: 'شارع التحرير عمارة 4',
    items: [{ packageId: 'pkg-1', variantId: 'black', quantity: 1 }],
  });
  assert.equal(missingPhone.valid, false);
  assert.equal(missingPhone.errorCode, 'INVALID_PHONE');
});

test('buildAppsScriptPayload produces exact required structure with all 17 order fields', () => {
  const validated = validateAndBuildOrderFields({
    submission_id: 'sub_abc_123456',
    customer_name: 'سارة علي',
    customer_phone: '01099887766',
    governorate: 'الجيزة',
    detailed_address: 'الدقي، شارع مصدق، عقار 12',
    items: [{ packageId: 'pkg-1', variantId: 'black', quantity: 1 }],
  });
  assert.ok(validated.orderFields);

  const payload = buildAppsScriptPayload(
    'secret_token_xyz',
    validated.submissionId!,
    validated.orderFields
  );

  assert.equal(payload.token, 'secret_token_xyz');
  assert.equal(payload.submission_id, 'sub_abc_123456');
  const expectedOrderKeys = [
    'customer_name',
    'customer_phone',
    'alternate_phone',
    'governorate',
    'city_or_area',
    'detailed_address',
    'delivery_notes',
    'product_name',
    'product_variant',
    'quantity',
    'customer_notes',
    'product_total',
    'delivery_fee',
    'discount_amount',
    'customer_total',
    'payment_method',
    'cod_amount',
  ];
  assert.deepEqual(Object.keys(payload.order), expectedOrderKeys);
});

test('evaluateAppsScriptResponse only confirms success when ok === true and order_id is valid or duplicate is true', () => {
  const okRes = evaluateAppsScriptResponse({
    ok: true,
    duplicate: false,
    order_id: 'SHQ-2026-0001',
    data_status: 'VALID',
  });
  assert.equal(okRes.success, true);
  assert.equal(okRes.orderId, 'SHQ-2026-0001');
  assert.equal(okRes.duplicate, false);

  const dupRes = evaluateAppsScriptResponse({
    ok: true,
    duplicate: true,
    order_id: 'SHQ-2026-0001',
    data_status: 'DUPLICATE',
  });
  assert.equal(dupRes.success, true);
  assert.equal(dupRes.duplicate, true);
  assert.equal(dupRes.orderId, 'SHQ-2026-0001');

  const missingOrderId = evaluateAppsScriptResponse({
    ok: true,
    duplicate: false,
    order_id: '',
  });
  assert.equal(missingOrderId.success, false);

  const failedRes = evaluateAppsScriptResponse({
    ok: false,
    error: 'Unauthorized',
  });
  assert.equal(failedRes.success, false);
});

test('generateServerOrderId creates concise SHQ-DDMM-XXX order IDs using today date + last 3 digits of customer phone', () => {
  const fixedDate = new Date('2026-10-24T10:00:00Z');
  const id1 = generateServerOrderId('01012345678', fixedDate);
  const id2 = generateServerOrderId('٠١٠١٢٣٤٥٦٧٨', fixedDate);
  const id3 = generateServerOrderId('01199999321', fixedDate);
  assert.equal(id1, 'SHQ-2410-678');
  assert.equal(id2, 'SHQ-2410-678');
  assert.equal(id3, 'SHQ-2410-321');
});

test('validateAndBuildOrderFields reverts to Bundle 1 price * 4 when quantity is 4 (320 * 4 = 1280 EGP)', () => {
  const res = validateAndBuildOrderFields({
    submission_id: 'sub_test_4packs',
    customer_name: 'محمود حسن',
    customer_phone: '01099887766',
    governorate: 'القاهرة',
    detailed_address: 'التجمع الخامس، شارع التسعين، عمارة 8',
    items: [{ packageId: 'pkg-1', variantId: 'black', quantity: 4 }],
  });

  assert.equal(res.valid, true);
  assert.ok(res.orderFields);
  assert.equal(res.orderFields.quantity, 4);
  assert.equal(res.orderFields.product_total, 1280);
  assert.equal(res.orderFields.delivery_fee, 0);
  assert.equal(res.orderFields.discount_amount, 400);
  assert.equal(res.orderFields.customer_total, 1280);
  assert.equal(res.orderFields.cod_amount, 1280);
  assert.equal(res.totalStrips, 120);
});
