/**
 * Redondea un precio a un valor profesional (termina en 500 o 990)
 * Ejemplos:
 * - 10325 -> 10500
 * - 10750 -> 10990
 * - 10000 -> 10000
 */
export const roundToProfessionalPrice = (price: number): number => {
  if (price <= 0) return price;
  
  // Redondear a la centena más cercana
  const roundedToHundred = Math.round(price / 100) * 100;
  
  // Obtener los últimos 3 dígitos
  const lastThreeDigits = roundedToHundred % 1000;
  
  // Si termina en 000, dejarlo así
  if (lastThreeDigits === 0) {
    return roundedToHundred;
  }
  
  // Si es menor a 500, redondear a 500
  if (lastThreeDigits < 500) {
    return roundedToHundred - lastThreeDigits + 500;
  }
  
  // Si es 500 o más, redondear a 990
  return roundedToHundred - lastThreeDigits + 990;
};

/**
 * Calcula el precio de exhibición basado en precio base + modificador
 * y lo redondea profesionalmente
 */
export const calculateDisplayPrice = (basePrice: number, priceModifier: number = 0): number => {
  const sumPrice = basePrice + priceModifier;
  return roundToProfessionalPrice(sumPrice);
};

