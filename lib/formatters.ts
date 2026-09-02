const numberFormatter = new Intl.NumberFormat("ja-JP");

export function formatCount(value: number, withUnit = true): string {
  const formatted = numberFormatter.format(value);
  return withUnit ? `${formatted}件` : formatted;
}

export function formatStoreCount(value: number): string {
  return `${numberFormatter.format(value)}店`;
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

export function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "更新時刻不明";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(date);
}

export function formatTargetMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return match ? `${match[1]}年${Number(match[2])}月` : value;
}

export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[1]}/${match[2]}/${match[3]}` : value;
}
