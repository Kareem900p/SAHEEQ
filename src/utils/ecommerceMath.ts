/**
 * محرك الحسابات المالية والتجارية الموحد (Single Source of Truth Financial Engine)
 * يضمن تطابق الأسعار، نسب الخصم، تكلفة الشريط الواحد، وأهلية الشحن المجاني
 * بين بطاقات المنتج، محدد الباقات، وسلة التسوق.
 */

export type PurchaseButtonState =
  | 'AVAILABLE'
  | 'ADDING_TO_CART'
  | 'ADDED_TO_CART'
  | 'OUT_OF_STOCK'
  | 'VARIANT_UNAVAILABLE'
  | 'ERROR';

export interface PackageTier {
  id: string;
  nameAr: string;
  nameEn?: string;
  packsCount: number;
  stripsCount: number;
  regularPrice: number;
  salePrice: number;
  currency: string;
  inStock: boolean;
  isBestValue?: boolean;
  badgeTextAr?: string;
  badgeTextEn?: string;
}

export interface ProductVariant {
  id: string;
  nameAr: string;
  nameEn: string;
  colorHex: string;
  secondaryHex?: string;
  badgeLabel?: string;
  inStock: boolean;
  stockCount: number;
  audience: 'adults' | 'kids';
  descriptionAr: string;
}

export interface CartItemInput {
  packageId: string;
  variantId: string;
  quantity: number;
}

export interface CartItemDetailed extends CartItemInput {
  lineId: string;
  packageNameAr: string;
  packageNameEn?: string;
  variantNameAr: string;
  colorHex: string;
  packsCount: number;
  stripsPerUnit: number;
  totalStrips: number;
  unitRegularPrice: number;
  unitSalePrice: number;
  lineRegularTotal: number;
  lineSaleTotal: number;
  lineSavings: number;
  discountPercent: number;
  badgeTextAr?: string;
  badgeTextEn?: string;
}

export interface ResolvedPackPricing {
  packCount: number;
  packageId: string;
  packageNameAr: string;
  packageNameEn: string;
  badgeTextAr?: string;
  badgeTextEn?: string;
  totalStrips: number;
  unitSalePrice: number;
  unitRegularPrice: number;
  lineSaleTotal: number;
  lineRegularTotal: number;
  lineSavings: number;
  discountPercent: number;
  isBundleTier: boolean;
}

export interface FreeShippingProgress {
  threshold: number;
  isEligible: boolean;
  remainingAmount: number;
  progressPercentage: number;
}

export interface CartSummary {
  items: CartItemDetailed[];
  totalQuantity: number;
  totalStrips: number;
  regularSubtotal: number;
  subtotal: number;
  totalSavings: number;
  totalSavingsPercent: number;
  shippingProgress: FreeShippingProgress;
  shippingCost: number;
  grandTotal: number;
}

/**
 * حساب نسبة الخصم المئوية من السعر الأساسي وسعر البيع الفعلي
 * discount_percentage = ((regular_price - sale_price) / regular_price) * 100
 */
export function calculateDiscountPercentage(regularPrice: number, salePrice: number): number {
  if (regularPrice <= 0 || salePrice < 0 || salePrice >= regularPrice) {
    return 0;
  }
  const raw = ((regularPrice - salePrice) / regularPrice) * 100;
  return Math.round(raw);
}

/**
 * حساب قيمة التوفير المالية
 */
export function calculateSavingsAmount(
  regularPrice: number,
  salePrice: number,
  quantity = 1
): number {
  if (quantity <= 0 || salePrice >= regularPrice) {
    return 0;
  }
  return Math.max(0, (regularPrice - salePrice) * quantity);
}

/**
 * حساب تكلفة الوحدة (الشريط الواحد) داخل الباقة
 * unit_price = package_price / number_of_units
 */
export function calculateUnitPrice(packagePrice: number, numberOfUnits: number): number {
  if (numberOfUnits <= 0 || packagePrice <= 0) {
    return 0;
  }
  return Math.round((packagePrice / numberOfUnits) * 100) / 100;
}

/**
 * يحوّل عدد العبوات (كل عبوة 30 لاصقة) إلى السعر والعرض المناسب تلقائياً:
 * - 1 عبوة -> الباندل الأول (pkg-1: 320 ج.م بدلاً من 420 ج.م)
 * - 2 عبوة -> الباندل الثاني (pkg-2: 595 ج.م بدلاً من 840 ج.م - أفضل عرض)
 * - 3 عبوات -> الباندل الثالث (pkg-3: 820 ج.م بدلاً من 1260 ج.م - أعلى توفير)
 * - 4 عبوات فأكثر -> يرجع لسعر الباندل الأول مضروباً في العدد (320 × N ج.م)
 */
export function resolvePackQuantityPricing(
  packCount: number,
  packages: PackageTier[]
): ResolvedPackPricing {
  const safeCount = Math.max(1, Math.floor(packCount || 1));
  const pkg1 = packages.find((p) => p.packsCount === 1 || p.id === 'pkg-1') || packages[0];
  const pkg2 = packages.find((p) => p.packsCount === 2 || p.id === 'pkg-2');
  const pkg3 = packages.find((p) => p.packsCount === 3 || p.id === 'pkg-3');

  if (safeCount === 1 && pkg1) {
    const lineSavings = calculateSavingsAmount(pkg1.regularPrice, pkg1.salePrice, 1);
    return {
      packCount: 1,
      packageId: pkg1.id,
      packageNameAr: pkg1.nameAr,
      packageNameEn: pkg1.nameEn || '1 Pack (30 Days)',
      badgeTextAr: pkg1.badgeTextAr,
      badgeTextEn: pkg1.badgeTextEn,
      totalStrips: pkg1.stripsCount,
      unitSalePrice: pkg1.salePrice,
      unitRegularPrice: pkg1.regularPrice,
      lineSaleTotal: pkg1.salePrice,
      lineRegularTotal: pkg1.regularPrice,
      lineSavings,
      discountPercent: calculateDiscountPercentage(pkg1.regularPrice, pkg1.salePrice),
      isBundleTier: true,
    };
  }

  if (safeCount === 2 && pkg2) {
    const lineSavings = calculateSavingsAmount(pkg2.regularPrice, pkg2.salePrice, 1);
    return {
      packCount: 2,
      packageId: pkg2.id,
      packageNameAr: pkg2.nameAr,
      packageNameEn: pkg2.nameEn || '2 Packs (60 Days)',
      badgeTextAr: pkg2.badgeTextAr || 'أفضل عرض',
      badgeTextEn: pkg2.badgeTextEn || 'Best Offer',
      totalStrips: pkg2.stripsCount,
      unitSalePrice: pkg2.salePrice,
      unitRegularPrice: pkg2.regularPrice,
      lineSaleTotal: pkg2.salePrice,
      lineRegularTotal: pkg2.regularPrice,
      lineSavings,
      discountPercent: calculateDiscountPercentage(pkg2.regularPrice, pkg2.salePrice),
      isBundleTier: true,
    };
  }

  if (safeCount === 3 && pkg3) {
    const lineSavings = calculateSavingsAmount(pkg3.regularPrice, pkg3.salePrice, 1);
    return {
      packCount: 3,
      packageId: pkg3.id,
      packageNameAr: pkg3.nameAr,
      packageNameEn: pkg3.nameEn || '3 Packs (90 Days)',
      badgeTextAr: pkg3.badgeTextAr || 'أعلى توفير',
      badgeTextEn: pkg3.badgeTextEn || 'Max Savings',
      totalStrips: pkg3.stripsCount,
      unitSalePrice: pkg3.salePrice,
      unitRegularPrice: pkg3.regularPrice,
      lineSaleTotal: pkg3.salePrice,
      lineRegularTotal: pkg3.regularPrice,
      lineSavings,
      discountPercent: calculateDiscountPercentage(pkg3.regularPrice, pkg3.salePrice),
      isBundleTier: true,
    };
  }

  // 4+ packs: revert to Bundle 1 price multiplied by safeCount
  const baseSale = pkg1 ? pkg1.salePrice : 320;
  const baseRegular = pkg1 ? pkg1.regularPrice : 420;
  const baseStrips = pkg1 ? pkg1.stripsCount : 30;
  const lineSaleTotal = baseSale * safeCount;
  const lineRegularTotal = baseRegular * safeCount;
  const lineSavings = calculateSavingsAmount(baseRegular, baseSale, safeCount);
  const totalStrips = baseStrips * safeCount;

  return {
    packCount: safeCount,
    packageId: pkg1 ? pkg1.id : 'pkg-1',
    packageNameAr: `${safeCount} عبوات (${totalStrips} يوم)`,
    packageNameEn: `${safeCount} Packs (${totalStrips} Days)`,
    badgeTextAr: `${safeCount} × سعر العبوة الواحدة`,
    badgeTextEn: `${safeCount} × Single Pack Price`,
    totalStrips,
    unitSalePrice: baseSale,
    unitRegularPrice: baseRegular,
    lineSaleTotal,
    lineRegularTotal,
    lineSavings,
    discountPercent: calculateDiscountPercentage(lineRegularTotal, lineSaleTotal),
    isBundleTier: false,
  };
}

/**
 * يحوّل عدد العبوات (packCount) إلى عنصر سلة قياسي متوافق مع الـ API
 */
export function packCountToCartItem(
  packCount: number,
  variantId = 'black'
): CartItemInput {
  const safeCount = Math.max(1, Math.floor(packCount || 1));
  if (safeCount === 1) {
    return { packageId: 'pkg-1', variantId, quantity: 1 };
  }
  if (safeCount === 2) {
    return { packageId: 'pkg-2', variantId, quantity: 1 };
  }
  if (safeCount === 3) {
    return { packageId: 'pkg-3', variantId, quantity: 1 };
  }
  return { packageId: 'pkg-1', variantId, quantity: safeCount };
}

/**
 * حساب أهلية الشحن المجاني والمبلغ المتبقي بدقة
 */
export function calculateFreeShippingProgress(
  subtotal: number,
  threshold: number
): FreeShippingProgress {
  const safeSubtotal = Math.max(0, subtotal);
  const safeThreshold = Math.max(0, threshold);

  if (safeThreshold === 0) {
    return {
      threshold: 0,
      isEligible: true,
      remainingAmount: 0,
      progressPercentage: 100,
    };
  }

  const remainingAmount = Math.max(0, safeThreshold - safeSubtotal);
  const isEligible = safeSubtotal >= safeThreshold;
  const progressPercentage = Math.min(
    100,
    Math.round((safeSubtotal / safeThreshold) * 100)
  );

  return {
    threshold: safeThreshold,
    isEligible,
    remainingAmount,
    progressPercentage,
  };
}

/**
 * حساب مصاريف الشحن حسب المحافظة:
 * - مجاني للطلبات >= 500 ج.م
 * - 85 ج.م للقاهرة
 * - 95 ج.م لباقي المحافظات
 */
export function calculateShippingByGovernorate(
  subtotal: number,
  governorate: string,
  freeShippingThreshold = 1000,
  cairoFee = 85,
  otherGovFee = 95
): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= freeShippingThreshold) return 0;
  const normalized = governorate.trim().toLowerCase();
  if (normalized === 'القاهرة' || normalized === 'cairo') {
    return cairoFee;
  }
  return otherGovFee;
}

/**
 * حساب ملخص السلة الكامل من مصدر حقيقة واحد
 * يعامل عبوة الـ 30 قطعة والكمية كعنصر موحد:
 * 1 عبوة -> الباندل 1 (320 ج.م)
 * 2 عبوة -> الباندل 2 (595 ج.م)
 * 3 عبوات -> الباندل 3 (820 ج.م)
 * 4+ عبوات -> الباندل 1 × العدد (320 × N ج.م)
 */
export function calculateCartSummary(
  cartItems: CartItemInput[],
  packages: PackageTier[],
  variants: ProductVariant[],
  freeShippingThreshold: number,
  standardShippingCost: number
): CartSummary {
  const pkgMap = new Map(packages.map((p) => [p.id, p]));
  const varMap = new Map(variants.map((v) => [v.id, v]));

  // Aggregate total 30-strip packs per variant so that product + quantity acts as one unified element
  const packsByVariant = new Map<string, number>();
  for (const item of cartItems) {
    if (item.quantity <= 0) continue;
    const pkg = pkgMap.get(item.packageId);
    const variant = varMap.get(item.variantId);
    if (!pkg || !variant) continue;

    const itemPacks = pkg.packsCount * item.quantity;
    packsByVariant.set(item.variantId, (packsByVariant.get(item.variantId) || 0) + itemPacks);
  }

  const detailed: CartItemDetailed[] = [];
  let totalQuantity = 0;
  let totalStrips = 0;
  let regularSubtotal = 0;
  let subtotal = 0;

  for (const [variantId, totalPacksForVariant] of packsByVariant.entries()) {
    const variant = varMap.get(variantId);
    if (!variant || totalPacksForVariant <= 0) continue;

    const resolved = resolvePackQuantityPricing(totalPacksForVariant, packages);
    const canonicalItem = packCountToCartItem(totalPacksForVariant, variantId);

    detailed.push({
      packageId: resolved.packageId,
      variantId,
      quantity: canonicalItem.quantity,
      packsCount: resolved.packCount,
      lineId: `unified__${variantId}`,
      packageNameAr: resolved.packageNameAr,
      packageNameEn: resolved.packageNameEn,
      variantNameAr: variant.nameAr,
      colorHex: variant.colorHex,
      stripsPerUnit: 30,
      totalStrips: resolved.totalStrips,
      unitRegularPrice: resolved.unitRegularPrice,
      unitSalePrice: resolved.unitSalePrice,
      lineRegularTotal: resolved.lineRegularTotal,
      lineSaleTotal: resolved.lineSaleTotal,
      lineSavings: resolved.lineSavings,
      discountPercent: resolved.discountPercent,
      badgeTextAr: resolved.badgeTextAr,
      badgeTextEn: resolved.badgeTextEn,
    });

    totalQuantity += resolved.packCount;
    totalStrips += resolved.totalStrips;
    regularSubtotal += resolved.lineRegularTotal;
    subtotal += resolved.lineSaleTotal;
  }

  const totalSavings = Math.max(0, regularSubtotal - subtotal);
  const totalSavingsPercent = calculateDiscountPercentage(regularSubtotal, subtotal);
  const shippingProgress = calculateFreeShippingProgress(subtotal, freeShippingThreshold);
  const shippingCost =
    subtotal === 0 ? 0 : shippingProgress.isEligible ? 0 : standardShippingCost;
  const grandTotal = subtotal + shippingCost;

  return {
    items: detailed,
    totalQuantity,
    totalStrips,
    regularSubtotal,
    subtotal,
    totalSavings,
    totalSavingsPercent,
    shippingProgress,
    shippingCost,
    grandTotal,
  };
}

/**
 * تحديد حالة زر الشراء الرئيسي وفق حالة المخزون والمتغير والتفاعل
 */
export function resolvePurchaseButtonState(params: {
  globalInStock: boolean;
  variantInStock: boolean;
  packageInStock: boolean;
  requestedQuantity: number;
  availableStock: number;
  isAdding: boolean;
  isAddedSuccess: boolean;
  hasError: boolean;
}): PurchaseButtonState {
  if (params.hasError) return 'ERROR';
  if (!params.globalInStock || !params.packageInStock) return 'OUT_OF_STOCK';
  if (!params.variantInStock) return 'VARIANT_UNAVAILABLE';
  if (params.requestedQuantity > params.availableStock) return 'OUT_OF_STOCK';
  if (params.isAdding) return 'ADDING_TO_CART';
  if (params.isAddedSuccess) return 'ADDED_TO_CART';
  return 'AVAILABLE';
}

/**
 * تنسيق العملة بالصيغة المعتمدة في الصفحة المرجعية أو العربية
 */
export function formatCurrencyEGP(amount: number, formatStyle: 'LE' | 'AR' = 'LE'): string {
  const formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  if (formatStyle === 'LE') {
    return `LE ${ amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }`;
  }
  return `${formattedNumber} ج.م`;
}
