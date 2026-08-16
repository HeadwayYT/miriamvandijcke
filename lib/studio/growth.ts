export type GrowthSignal = {
  id: string;
  month: string;
  instagramFollowers: number;
  invitations: number;
  collaborations: number;
  note: string | null;
};

export type GrowthSignalRow = {
  id: string;
  month: string;
  instagram_followers: number;
  invitations: number;
  collaborations: number;
  note: string | null;
};

export type FollowerDelta = {
  value: number;
  previousMonth: string;
};

const belgiumTimeZone = "Europe/Brussels";
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getBelgiumMonthKey(
  value: Date = new Date(),
  timeZone: string = belgiumTimeZone,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}`;
}

export function isGrowthMonthKey(value: string): boolean {
  return monthPattern.test(value);
}

export function formatGrowthMonth(month: string, language: "en" | "nl"): string {
  if (!isGrowthMonthKey(month)) return month;
  return new Intl.DateTimeFormat(language === "nl" ? "nl-BE" : "en-GB", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

export function rowsToGrowthSignals(rows: GrowthSignalRow[]): GrowthSignal[] {
  return rows.flatMap((row) => {
    if (
      !row.id ||
      !isGrowthMonthKey(row.month) ||
      !isNonNegativeInteger(row.instagram_followers) ||
      !isNonNegativeInteger(row.invitations) ||
      !isNonNegativeInteger(row.collaborations) ||
      (row.note !== null && (typeof row.note !== "string" || row.note.length > 160))
    ) {
      return [];
    }

    return [{
      id: row.id,
      month: row.month,
      instagramFollowers: row.instagram_followers,
      invitations: row.invitations,
      collaborations: row.collaborations,
      note: row.note?.trim() || null,
    }];
  }).sort((a, b) => b.month.localeCompare(a.month));
}

export function followerDeltaForMonth(
  records: GrowthSignal[],
  month: string,
): FollowerDelta | null {
  const ordered = [...records].sort((a, b) => b.month.localeCompare(a.month));
  const currentIndex = ordered.findIndex((record) => record.month === month);
  if (currentIndex < 0) return null;

  const previous = ordered.slice(currentIndex + 1).find((record) => record.month < month);
  if (!previous) return null;

  return {
    value: ordered[currentIndex].instagramFollowers - previous.instagramFollowers,
    previousMonth: previous.month,
  };
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
