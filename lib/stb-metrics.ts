import type { Staff, StbDashboard } from "@/types/dashboard";

export type StaffStbMetrics = {
  attachmentCount: number | null;
  attachmentRate: number | null;
};

export function createStaffStbMetrics(
  stb: StbDashboard | null,
  staff: Staff[]
): Map<string, StaffStbMetrics> {
  const result = new Map<string, StaffStbMetrics>();
  const summaries = stb?.byStaff;
  if (!summaries) return result;

  const byId = new Map(summaries.map((item) => [item.staffId, item]));
  for (const person of staff) {
    const summary = byId.get(person.id);
    if (!summary) {
      if (person.personalActual === 0) {
        result.set(person.id, { attachmentCount: 0, attachmentRate: null });
      }
      continue;
    }

    if (summary.applicationCount !== person.personalActual) {
      console.warn("[stb] count_mismatch", {
        personalActual: person.personalActual,
        stbSummaryApplicationCount: summary.applicationCount,
      });
      continue;
    }

    result.set(person.id, {
      attachmentCount: summary.stbApplicationCount,
      attachmentRate: summary.applicationCount
        ? summary.stbApplicationCount / summary.applicationCount
        : null,
    });
  }
  return result;
}
