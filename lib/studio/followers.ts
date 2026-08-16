export type FollowerSnapshot = {
  id: string;
  date: string;
  followerCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FollowerSnapshotRow = {
  id: string;
  snapshot_date: string;
  follower_count: number;
  created_at: string;
  updated_at: string;
};

const belgiumTimeZone = "Europe/Brussels";
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const maximumFollowerCount = 1_000_000_000;

export function getBelgiumDateKey(
  value: Date = new Date(),
  timeZone: string = belgiumTimeZone,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isFollowerDateKey(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function parsePositiveFollowerCount(value: unknown): number | null {
  const normalized = typeof value === "number" ? String(value) : value;
  if (typeof normalized !== "string" || !/^\d+$/.test(normalized.trim())) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximumFollowerCount
    ? parsed
    : null;
}

export function rowsToFollowerSnapshots(rows: FollowerSnapshotRow[]): FollowerSnapshot[] {
  return rows.flatMap((row) => {
    if (
      !row.id
      || !isFollowerDateKey(row.snapshot_date)
      || parsePositiveFollowerCount(row.follower_count) === null
      || !isIsoTimestamp(row.created_at)
      || !isIsoTimestamp(row.updated_at)
    ) {
      return [];
    }

    return [{
      id: row.id,
      date: row.snapshot_date,
      followerCount: row.follower_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }];
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function mergeFollowerSnapshot(
  snapshots: FollowerSnapshot[],
  next: FollowerSnapshot,
): FollowerSnapshot[] {
  return [...snapshots.filter((snapshot) => snapshot.date !== next.date), next]
    .sort((a, b) => a.date.localeCompare(b.date));
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}
