import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDiscountPercentage,
  calculateSavingsAmount,
  calculateUnitPrice,
  calculateFreeShippingProgress,
  calculateShippingByGovernorate,
  calculateCartSummary,
  resolvePurchaseButtonState,
  resolvePackQuantityPricing,
  packCountToCartItem,
} from './ecommerceMath';
import { PRODUCT_PACKAGES, PRODUCT_VARIANTS, CUSTOMER_REVIEWS_DATA } from '../data/brandConfig';
import { DESIGN_TOKENS } from '../styles/design-tokens';

test('CUSTOMER_REVIEWS_DATA has 26 total reviews ordered sequentially for CRO without trailing copy text', () => {
  assert.equal(CUSTOMER_REVIEWS_DATA.length, 26);
  // First review hooks with spouse sleep comfort, second with snoring reduction
  assert.equal(CUSTOMER_REVIEWS_DATA[0].id, 'rev-cro-1');
  assert.equal(CUSTOMER_REVIEWS_DATA[0].tagAr, 'النوم');
  assert.equal(CUSTOMER_REVIEWS_DATA[1].id, 'rev-cro-2');
  assert.equal(CUSTOMER_REVIEWS_DATA[1].tagAr, 'الشخير');
  // Last review closes with 2-pack fast 48h delivery + 24h hold
  assert.equal(CUSTOMER_REVIEWS_DATA[25].id, 'rev-5');
  // Ensure no review has trailing "نسخ التقييم"
  for (const rev of CUSTOMER_REVIEWS_DATA) {
    assert.equal(rev.textAr.includes('نسخ التقييم'), false);
    assert.ok(rev.textAr.length > 10);
  }
});

test('PRODUCT_PACKAGES has exactly 3 bundles with pkg-2 (2 Packs) marked as Best Offer', () => {
  assert.equal(PRODUCT_PACKAGES.length, 3);
  assert.equal(PRODUCT_PACKAGES[0].id, 'pkg-1');
  assert.equal(PRODUCT_PACKAGES[1].id, 'pkg-2');
  assert.equal(PRODUCT_PACKAGES[1].isBestValue, true);
  assert.equal(PRODUCT_PACKAGES[1].badgeTextAr, 'أفضل عرض');
  assert.equal(PRODUCT_PACKAGES[2].id, 'pkg-3');
});

test('resolvePackQuantityPricing maps 1->Bundle1(320), 2->Bundle2(595), 3->Bundle3(820), and 4->Bundle1*4(1280)', () => {
  const tier1 = resolvePackQuantityPricing(1, PRODUCT_PACKAGES);
  assert.equal(tier1.packageId, 'pkg-1');
  assert.equal(tier1.lineSaleTotal, 320);
  assert.equal(tier1.lineRegularTotal, 420);
  assert.equal(tier1.totalStrips, 30);

  const tier2 = resolvePackQuantityPricing(2, PRODUCT_PACKAGES);
  assert.equal(tier2.packageId, 'pkg-2');
  assert.equal(tier2.lineSaleTotal, 595);
  assert.equal(tier2.lineRegularTotal, 840);
  assert.equal(tier2.totalStrips, 60);

  const tier3 = resolvePackQuantityPricing(3, PRODUCT_PACKAGES);
  assert.equal(tier3.packageId, 'pkg-3');
  assert.equal(tier3.lineSaleTotal, 820);
  assert.equal(tier3.lineRegularTotal, 1260);
  assert.equal(tier3.totalStrips, 90);

  const tier4 = resolvePackQuantityPricing(4, PRODUCT_PACKAGES);
  assert.equal(tier4.packageId, 'pkg-1');
  assert.equal(tier4.lineSaleTotal, 1280); // 320 * 4
  assert.equal(tier4.lineRegularTotal, 1680); // 420 * 4
  assert.equal(tier4.totalStrips, 120);
  assert.equal(tier4.isBundleTier, false);

  assert.deepEqual(packCountToCartItem(2, 'black'), {
    packageId: 'pkg-2',
    variantId: 'black',
    quantity: 1,
  });
  assert.deepEqual(packCountToCartItem(4, 'black'), {
    packageId: 'pkg-1',
    variantId: 'black',
    quantity: 4,
  });
});

test('DESIGN_TOKENS enforces Changa font family, 1200px container, 16/24/32px padding, 4px/8px spacing, 1.618 golden ratio, and 44px touch target', () => {
  assert.ok(DESIGN_TOKENS.typography.fontFamily.brand.includes('Changa'));
  assert.ok(DESIGN_TOKENS.typography.fontFamily.arabic.includes('Changa'));
  assert.ok(DESIGN_TOKENS.typography.fontFamily.latin.includes('Changa'));
  assert.equal(DESIGN_TOKENS.layout.maxWidth, '1200px');
  assert.equal(DESIGN_TOKENS.layout.containerPadding.mobile, '16px');
  assert.equal(DESIGN_TOKENS.layout.containerPadding.tablet, '24px');
  assert.equal(DESIGN_TOKENS.layout.containerPadding.desktop, '32px');
  assert.equal(DESIGN_TOKENS.layout.goldenRatio, 1.618);
  assert.equal(DESIGN_TOKENS.layout.touchTargetMin, '44px');
  assert.ok(DESIGN_TOKENS.typography.scale.body.fontSize.includes('clamp('));
});

test('calculateDiscountPercentage matches the 3 bundle tiers accurately (24%, 29%, 35%)', () => {
  assert.equal(calculateDiscountPercentage(420, 320), 24);
  assert.equal(calculateDiscountPercentage(840, 595), 29);
  assert.equal(calculateDiscountPercentage(1260, 820), 35);
  assert.equal(calculateDiscountPercentage(320, 320), 0);
});

test('calculateSavingsAmount computes exact EGP savings per bundle (100, 245, 440 EGP)', () => {
  assert.equal(calculateSavingsAmount(420, 320, 1), 100);
  assert.equal(calculateSavingsAmount(840, 595, 1), 245);
  assert.equal(calculateSavingsAmount(1260, 820, 1), 440);
});

test('calculateUnitPrice computes daily cost across the 3 bundle tiers', () => {
  assert.equal(calculateUnitPrice(320, 30), 10.67);
  assert.equal(calculateUnitPrice(595, 60), 9.92);
  assert.equal(calculateUnitPrice(820, 90), 9.11);
});

test('calculateFreeShippingProgress enforces 500 EGP threshold (2-Pack & 3-Pack unlock Free Shipping)', () => {
  const pkg1 = calculateFreeShippingProgress(320, 500);
  assert.equal(pkg1.isEligible, false);
  assert.equal(pkg1.remainingAmount, 180);

  const pkg2 = calculateFreeShippingProgress(595, 500);
  assert.equal(pkg2.isEligible, true);
  assert.equal(pkg2.remainingAmount, 0);

  const pkg3 = calculateFreeShippingProgress(820, 500);
  assert.equal(pkg3.isEligible, true);
  assert.equal(pkg3.remainingAmount, 0);
});

test('calculateShippingByGovernorate applies 85 EGP for Cairo, 95 EGP for other governorates below 500 EGP, and 0 EGP at/above 500 EGP', () => {
  assert.equal(calculateShippingByGovernorate(320, 'القاهرة', 500, 85, 95), 85);
  assert.equal(calculateShippingByGovernorate(320, 'الجيزة', 500, 85, 95), 95);
  assert.equal(calculateShippingByGovernorate(595, 'القاهرة', 500, 85, 95), 0);
  assert.equal(calculateShippingByGovernorate(595, 'الإسكندرية', 500, 85, 95), 0);
  assert.equal(calculateShippingByGovernorate(820, 'المنصورة', 500, 85, 95), 0);
});

test('calculateCartSummary applies unified pack tier pricing (1->320, 2->595, 3->820, 4->1280)', () => {
  const summarySingle = calculateCartSummary(
    [{ packageId: 'pkg-1', variantId: 'black', quantity: 1 }],
    PRODUCT_PACKAGES,
    PRODUCT_VARIANTS,
    500,
    85
  );
  assert.equal(summarySingle.subtotal, 320);
  assert.equal(summarySingle.shippingCost, 85);
  assert.equal(summarySingle.grandTotal, 405);

  // Passing pkg-1 with quantity 2 automatically resolves to Bundle 2 (595 EGP + Free Shipping)
  const summaryQty2 = calculateCartSummary(
    [{ packageId: 'pkg-1', variantId: 'black', quantity: 2 }],
    PRODUCT_PACKAGES,
    PRODUCT_VARIANTS,
    500,
    85
  );
  assert.equal(summaryQty2.subtotal, 595);
  assert.equal(summaryQty2.shippingCost, 0);
  assert.equal(summaryQty2.grandTotal, 595);

  // Passing pkg-1 with quantity 3 automatically resolves to Bundle 3 (820 EGP + Free Shipping)
  const summaryQty3 = calculateCartSummary(
    [{ packageId: 'pkg-1', variantId: 'black', quantity: 3 }],
    PRODUCT_PACKAGES,
    PRODUCT_VARIANTS,
    500,
    85
  );
  assert.equal(summaryQty3.subtotal, 820);
  assert.equal(summaryQty3.shippingCost, 0);
  assert.equal(summaryQty3.grandTotal, 820);

  // Passing pkg-1 with quantity 4 reverts to Bundle 1 price * 4 (1280 EGP + Free Shipping)
  const summaryQty4 = calculateCartSummary(
    [{ packageId: 'pkg-1', variantId: 'black', quantity: 4 }],
    PRODUCT_PACKAGES,
    PRODUCT_VARIANTS,
    500,
    85
  );
  assert.equal(summaryQty4.subtotal, 1280);
  assert.equal(summaryQty4.shippingCost, 0);
  assert.equal(summaryQty4.grandTotal, 1280);
});

test('resolvePurchaseButtonState handles all required button states', () => {
  assert.equal(
    resolvePurchaseButtonState({
      globalInStock: true,
      variantInStock: true,
      packageInStock: true,
      requestedQuantity: 1,
      availableStock: 10,
      isAdding: false,
      isAddedSuccess: false,
      hasError: false,
    }),
    'AVAILABLE'
  );
});
