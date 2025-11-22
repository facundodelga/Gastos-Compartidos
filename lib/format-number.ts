export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toFixed(0);
}

export function formatCurrency(amount: number, currency: string): string {
  const formatted = formatNumber(Math.abs(amount));
  return `${formatted} ${currency}`;
}

export function formatMoney(amount: number, currency: string, locale = 'es-AR'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}${formatted} ${currency}`;
}