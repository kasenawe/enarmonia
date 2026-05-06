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
  if (day === 6) return schedule.saturday;
  if (day === 0) return schedule.sunday;
  return schedule.weekdays;
}

export function normalizeSchedule(raw: unknown): Schedule {
  const source = (raw || {}) as any;

  return {
    weekdays: {
      enabled: source.weekdays?.enabled !== false,
      startTime:
        source.weekdays?.startTime || DEFAULT_SCHEDULE.weekdays.startTime,
      endTime: source.weekdays?.endTime || DEFAULT_SCHEDULE.weekdays.endTime,
      slotIntervalMinutes:
        Number(source.weekdays?.slotIntervalMinutes) ||
        DEFAULT_SCHEDULE.weekdays.slotIntervalMinutes,
      breaks: Array.isArray(source.weekdays?.breaks)
        ? source.weekdays.breaks
        : DEFAULT_SCHEDULE.weekdays.breaks,
    },
    saturday: {
      enabled: source.saturday?.enabled === true,
      startTime:
        source.saturday?.startTime || DEFAULT_SCHEDULE.saturday.startTime,
      endTime: source.saturday?.endTime || DEFAULT_SCHEDULE.saturday.endTime,
      slotIntervalMinutes:
        Number(source.saturday?.slotIntervalMinutes) ||
        DEFAULT_SCHEDULE.saturday.slotIntervalMinutes,
      breaks: Array.isArray(source.saturday?.breaks)
        ? source.saturday.breaks
        : DEFAULT_SCHEDULE.saturday.breaks,
    },
    sunday: {
      enabled: source.sunday?.enabled === true,
      startTime: source.sunday?.startTime || DEFAULT_SCHEDULE.sunday.startTime,
      endTime: source.sunday?.endTime || DEFAULT_SCHEDULE.sunday.endTime,
      slotIntervalMinutes:
        Number(source.sunday?.slotIntervalMinutes) ||
        DEFAULT_SCHEDULE.sunday.slotIntervalMinutes,
      breaks: Array.isArray(source.sunday?.breaks)
        ? source.sunday.breaks
        : DEFAULT_SCHEDULE.sunday.breaks,
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
