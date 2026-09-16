const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getTokyoCurrentMonth(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) throw new Error("Could not determine current month");
  return `${year}-${month}`;
}

export function getTokyoToday(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(date);
}

export function resolveTargetMonth(value: unknown, currentMonth: string): string {
  if (typeof value !== "string" || !MONTH_PATTERN.test(value)) {
    return currentMonth;
  }

  return value <= currentMonth ? value : currentMonth;
}

export function shiftMonth(value: string, offset: number): string {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function createMonthOptions(
  currentMonth: string,
  selectedMonth: string,
  pastMonths = 12
): string[] {
  const options = Array.from({ length: pastMonths + 1 }, (_, index) =>
    shiftMonth(currentMonth, -index)
  );

  if (selectedMonth < options.at(-1)!) options.push(selectedMonth);
  return options;
}

export function resolveStbTargetMonth(value: unknown, currentMonth: string): string {
  const nextMonth = shiftMonth(currentMonth, 1);
  if (typeof value !== "string" || !MONTH_PATTERN.test(value)) return nextMonth;
  const earliestMonth = shiftMonth(currentMonth, -12);
  const latestMonth = shiftMonth(currentMonth, 18);
  return value >= earliestMonth && value <= latestMonth ? value : nextMonth;
}

export function createStbMonthOptions(currentMonth: string, selectedMonth: string): string[] {
  const futureMonths = Array.from({ length: 18 }, (_, index) =>
    shiftMonth(currentMonth, index + 1)
  );
  const pastMonths = createMonthOptions(currentMonth, selectedMonth).slice(1);
  return [currentMonth, ...futureMonths, ...pastMonths];
}
