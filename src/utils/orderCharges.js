export const GST_RATE = 0.05;
export const PLATFORM_FEE = 5;
export const DELIVERY_CHARGE = 20;
export const AGENT_DELIVERY_PAYOUT = 20;

const roundMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export const calculateOrderCharges = (subtotal = 0, discount = 0) => {
  const itemTotal = roundMoney(subtotal);
  const discountAmount = roundMoney(discount);
  const taxableAmount = roundMoney(Math.max(itemTotal - discountAmount, 0));
  const gstAmount = roundMoney(taxableAmount * GST_RATE);
  const platformFee = taxableAmount > 0 ? PLATFORM_FEE : 0;
  const deliveryCharge = taxableAmount > 0 ? DELIVERY_CHARGE : 0;
  const finalAmount = roundMoney(taxableAmount + gstAmount + platformFee + deliveryCharge);

  return {
    itemTotal,
    discountAmount,
    taxableAmount,
    gstAmount,
    platformFee,
    deliveryCharge,
    finalAmount,
  };
};

export const money = (value) => `Rs ${Number(value || 0).toFixed(0)}`;
