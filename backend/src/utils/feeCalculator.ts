import { prisma } from '../config/prisma';

export const calculateDeliveryFee = async (orderAmount: number): Promise<number> => {
  let minFee = 5.0;
  let maxFee = 30.0;
  let percentage = 0.10;

  try {
    const minConfig = await prisma.systemConfig.findUnique({ where: { key: 'min_delivery_fee' } });
    const maxConfig = await prisma.systemConfig.findUnique({ where: { key: 'max_delivery_fee' } });
    const pctConfig = await prisma.systemConfig.findUnique({ where: { key: 'fee_percentage' } });

    if (minConfig) minFee = parseFloat(minConfig.value);
    if (maxConfig) maxFee = parseFloat(maxConfig.value);
    if (pctConfig) percentage = parseFloat(pctConfig.value);
  } catch (err) {
    // Fall back to default rules if DB read fails
  }

  const calculatedPct = orderAmount * percentage;
  // Delivery Fee Rule: Minimum ₹5, Maximum ₹30, or 10% of order amount, whichever is lower.
  const baseFee = Math.min(calculatedPct, maxFee);
  const finalFee = Math.max(minFee, baseFee);

  return Math.round(finalFee * 100) / 100;
};
