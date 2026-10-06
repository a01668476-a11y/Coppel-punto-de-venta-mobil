export interface CreditQuote {
  quincenas: number;
  quincenalPayment: number;
  totalCreditPrice: number;
  cashPrice: number;
  initialPayment: number;
  financedAmount: number;
  onTimeDiscountAmount: number;
  finalOnTimeTotal: number;
}

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function calculateCoppelCredit(
  cashPrice: number,
  quincenas: number = 24,
  initialPayment: number = 0,
  discountPercentage: number = 0
): CreditQuote {
  // Coppel standard credit factor approx based on quincenas
  // 12 quincenas (6 months) ~ 1.25x
  // 18 quincenas (9 months) ~ 1.28x
  // 24 quincenas (12 months) ~ 1.30x
  // 36 quincenas (18 months) ~ 1.38x
  // 48 quincenas (24 months) ~ 1.45x
  let multiplier = 1.30;
  if (quincenas <= 12) multiplier = 1.22;
  else if (quincenas <= 18) multiplier = 1.26;
  else if (quincenas <= 24) multiplier = 1.30;
  else if (quincenas <= 36) multiplier = 1.38;
  else multiplier = 1.45;

  const totalCreditBase = Math.round(cashPrice * multiplier);
  const financed = Math.max(0, totalCreditBase - initialPayment);
  const quincenalPayment = Math.ceil(financed / quincenas);
  const totalCreditPrice = (quincenalPayment * quincenas) + initialPayment;

  // Beneficio por pago puntual
  const interestPortion = Math.max(0, totalCreditPrice - cashPrice);
  const onTimeDiscountAmount = Math.round(interestPortion * (discountPercentage / 100));
  const finalOnTimeTotal = totalCreditPrice - onTimeDiscountAmount;

  return {
    quincenas,
    quincenalPayment,
    totalCreditPrice,
    cashPrice,
    initialPayment,
    financedAmount: financed,
    onTimeDiscountAmount,
    finalOnTimeTotal,
  };
}

export function playBeepSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio context may be restricted before gesture
  }
}
