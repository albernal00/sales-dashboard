const numberFormatter = new Intl.NumberFormat("ja-JP");

export function formatCount(value: number, withUnit = true): string {
  const formatted = numberFormatter.format(value);
  return withUnit ? `${formatted}件` : formatted;
}

export function formatSignedCount(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCount(value)}`;
}

export function formatCurrency(
  value: number,
  notation: "symbol" | "suffix" = "suffix"
): string {
  const formatted = numberFormatter.format(value);
  return notation === "symbol" ? `¥${formatted}` : `${formatted}円`;
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}
