export const momentumActions = ["capture", "share", "connect"] as const;

export type MomentumAction = (typeof momentumActions)[number];

export type MomentumActivity = {
  action: MomentumAction;
  weekKey: string;
  sourceUrl?: string | null;
};

export type MomentumStatus = {
  weekKey: string;
  completed: Record<MomentumAction, boolean>;
  completedCount: number;
  currentShareUrl: string | null;
  isMomentumWeek: boolean;
  currentStreak: number;
};

const belgiumTimeZone = "Europe/Brussels";
const isoWeekPattern = /^(\d{4})-W(\d{2})$/;
export const manualShareSourceId = "manual-share";

export function isTrustedMomentumSource(
  action: MomentumAction,
  sourceId: string,
): boolean {
  return action !== "share" || sourceId === manualShareSourceId;
}

export function getIsoWeekKey(
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

  return isoWeekKeyFromCalendarDate(
    Number(values.year),
    Number(values.month),
    Number(values.day),
  );
}

export function previousIsoWeekKey(weekKey: string): string {
  const match = isoWeekPattern.exec(weekKey);
  if (!match) throw new Error(`Invalid ISO week key: ${weekKey}`);

  const year = Number(match[1]);
  const week = Number(match[2]);
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const januaryFourthDay = (januaryFourth.getUTCDay() + 6) % 7;
  const monday = new Date(januaryFourth);
  monday.setUTCDate(januaryFourth.getUTCDate() - januaryFourthDay + ((week - 1) * 7) - 7);

  return isoWeekKeyFromCalendarDate(
    monday.getUTCFullYear(),
    monday.getUTCMonth() + 1,
    monday.getUTCDate(),
  );
}

export function calculateMomentumStatus(
  activities: MomentumActivity[],
  now: Date = new Date(),
): MomentumStatus {
  const weekKey = getIsoWeekKey(now);
  const activityByWeek = new Map<string, Set<MomentumAction>>();

  for (const activity of activities) {
    if (!momentumActions.includes(activity.action) || !isoWeekPattern.test(activity.weekKey)) {
      continue;
    }

    const actions = activityByWeek.get(activity.weekKey) ?? new Set<MomentumAction>();
    actions.add(activity.action);
    activityByWeek.set(activity.weekKey, actions);
  }

  const currentActions = activityByWeek.get(weekKey) ?? new Set<MomentumAction>();
  const completed = {
    capture: currentActions.has("capture"),
    share: currentActions.has("share"),
    connect: currentActions.has("connect"),
  };
  const completedCount = Object.values(completed).filter(Boolean).length;
  const currentShareUrl = activities.find(
    (activity) => (
      activity.action === "share"
      && activity.weekKey === weekKey
      && activity.sourceUrl
    ),
  )?.sourceUrl ?? null;
  const isMomentumWeek = completedCount >= 2;

  let streakWeek = isMomentumWeek ? weekKey : previousIsoWeekKey(weekKey);
  let currentStreak = 0;

  while ((activityByWeek.get(streakWeek)?.size ?? 0) >= 2 && currentStreak < 520) {
    currentStreak += 1;
    streakWeek = previousIsoWeekKey(streakWeek);
  }

  return {
    weekKey,
    completed,
    completedCount,
    currentShareUrl,
    isMomentumWeek,
    currentStreak,
  };
}

function isoWeekKeyFromCalendarDate(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNumber = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNumber + 3);
  const weekYear = date.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(weekYear, 0, 4));
  const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDay + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / 604_800_000);

  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}
