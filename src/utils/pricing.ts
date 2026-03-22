export const normalizeDiscountPercent = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const integer = Math.floor(parsed);
  if (integer < 0) return 0;
  if (integer > 100) return 100;
  return integer;
};

export const getDiscountedPrice = (price: number, discountPercent?: number | null): number => {
  const safePrice = Number(price) || 0;
  const safeDiscount = normalizeDiscountPercent(discountPercent);
  if (safeDiscount <= 0) return safePrice;

  const discounted = safePrice * (1 - safeDiscount / 100);
  return Math.max(0, Math.round(discounted));
};

export const getDiscountedUnitPrice = (
  basePrice: number,
  variationModifier: number = 0,
  discountPercent?: number | null
): number => {
  return getDiscountedPrice((Number(basePrice) || 0) + (Number(variationModifier) || 0), discountPercent);
};
