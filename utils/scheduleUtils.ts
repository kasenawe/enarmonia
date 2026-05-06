import {
  Schedule,
  ScheduleBreak,
  ScheduleSegment,
  OccupiedSlot,
  BlockedSlot,
} from "../types";
import { DEFAULT_SCHEDULE } from "../constants";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function isInBreak(slotMin: number, breaks: ScheduleBreak[]): boolean {
  return breaks.some((b) => {
    const bStart = timeToMinutes(b.start);
    const bEnd = timeToMinutes(b.end);
    return slotMin >= bStart && slotMin < bEnd;
  });
}

/** Returns true if the interval [slotMin, slotMin+durationMin) overlaps any break */
export function overlapsBreak(
  slotMin: number,
  durationMin: number,
  breaks: ScheduleBreak[],
): boolean {
  const slotEnd = slotMin + durationMin;
  return breaks.some((b) => {
    const bStart = timeToMinutes(b.start);
    const bEnd = timeToMinutes(b.end);
    return slotMin < bEnd && slotEnd > bStart;
  });
}

/** Generate all valid start times for one schedule segment and service duration */
export function generateTimeSlots(
  segment: ScheduleSegment,
  serviceDurationMinutes = 60,
): string[] {
  if (!segment.enabled) return [];

  const start = timeToMinutes(segment.startTime);
  const end = timeToMinutes(segment.endTime);
  const interval = segment.slotIntervalMinutes;
  const slots: string[] = [];

  for (let t = start; t + serviceDurationMinutes <= end; t += interval) {
    if (!overlapsBreak(t, serviceDurationMinutes, segment.breaks)) {
      slots.push(minutesToTime(t));
    }
  }

  return slots;
}

export function getScheduleSegmentForDay(
  schedule: Schedule,
  day: number,
): ScheduleSegment {
  // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6 ? schedule.weekend : schedule.weekdays;
}

export function normalizeSchedule(raw: unknown): Schedule {
  const source = (raw || {}) as any;

  // New shape: { weekdays, weekend }
  if (source.weekdays && source.weekend) {
    return {
      weekdays: {
        enabled: source.weekdays.enabled !== false,
        startTime:
          source.weekdays.startTime || DEFAULT_SCHEDULE.weekdays.startTime,
        endTime: source.weekdays.endTime || DEFAULT_SCHEDULE.weekdays.endTime,
        slotIntervalMinutes:
          Number(source.weekdays.slotIntervalMinutes) ||
          DEFAULT_SCHEDULE.weekdays.slotIntervalMinutes,
        breaks: Array.isArray(source.weekdays.breaks)
          ? source.weekdays.breaks
          : DEFAULT_SCHEDULE.weekdays.breaks,
      },
      weekend: {
        enabled: source.weekend.enabled === true,
        startTime:
          source.weekend.startTime || DEFAULT_SCHEDULE.weekend.startTime,
        endTime: source.weekend.endTime || DEFAULT_SCHEDULE.weekend.endTime,
        slotIntervalMinutes:
          Number(source.weekend.slotIntervalMinutes) ||
          DEFAULT_SCHEDULE.weekend.slotIntervalMinutes,
        breaks: Array.isArray(source.weekend.breaks)
          ? source.weekend.breaks
          : DEFAULT_SCHEDULE.weekend.breaks,
      },
    };
  }

  // Legacy shape fallback: { workDays, startTime, endTime, slotIntervalMinutes, breaks }
  const workDays: number[] = Array.isArray(source.workDays)
    ? source.workDays
    : [];
  const hasWeekendDays = workDays.includes(0) || workDays.includes(6);
  const hasWeekdays = workDays.some((d) => d >= 1 && d <= 5);

  return {
    weekdays: {
      enabled: hasWeekdays,
      startTime: source.startTime || DEFAULT_SCHEDULE.weekdays.startTime,
      endTime: source.endTime || DEFAULT_SCHEDULE.weekdays.endTime,
      slotIntervalMinutes:
        Number(source.slotIntervalMinutes) ||
        DEFAULT_SCHEDULE.weekdays.slotIntervalMinutes,
      breaks: Array.isArray(source.breaks)
        ? source.breaks
        : DEFAULT_SCHEDULE.weekdays.breaks,
    },
    weekend: {
      enabled: hasWeekendDays,
      startTime: source.startTime || DEFAULT_SCHEDULE.weekend.startTime,
      endTime: source.endTime || DEFAULT_SCHEDULE.weekend.endTime,
      slotIntervalMinutes:
        Number(source.slotIntervalMinutes) ||
        DEFAULT_SCHEDULE.weekend.slotIntervalMinutes,
      breaks: Array.isArray(source.breaks)
        ? source.breaks
        : DEFAULT_SCHEDULE.weekend.breaks,
    },
  };
}

/** Check if a proposed slot [slotTime, slotTime+serviceDuration) overlaps an occupied slot */
export function slotOverlapsOccupied(
  date: string,
  slotTime: string,
  serviceDurationMinutes: number,
  occupiedSlots: OccupiedSlot[],
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + serviceDurationMinutes;

  return occupiedSlots.some((occ) => {
    if (occ.date !== date) return false;
    const occStart = timeToMinutes(occ.time);
    const occEnd = occStart + (occ.duration ?? 60);
    return slotStart < occEnd && slotEnd > occStart;
  });
}

/** Check if a proposed slot [slotTime, slotTime+serviceDuration) is covered by any blocked time */
export function slotOverlapsBlocked(
  date: string,
  slotTime: string,
  serviceDurationMinutes: number,
  blockedSlots: BlockedSlot[],
  intervalMinutes: number,
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + serviceDurationMinutes;

  return blockedSlots.some((b) => {
    if (b.date !== date) return false;
    // A blocked time occupies [blockStart, blockStart+interval)
    const bStart = timeToMinutes(b.time);
    const bEnd = bStart + intervalMinutes;
    return slotStart < bEnd && slotEnd > bStart;
  });
}
