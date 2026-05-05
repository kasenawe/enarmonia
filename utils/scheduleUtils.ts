import { Schedule, ScheduleBreak, OccupiedSlot, BlockedSlot } from "../types";

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

/** Generate all valid start times for the given schedule and service duration */
export function generateTimeSlots(
  schedule: Schedule,
  serviceDurationMinutes = 60,
): string[] {
  const start = timeToMinutes(schedule.startTime);
  const end = timeToMinutes(schedule.endTime);
  const interval = schedule.slotIntervalMinutes;
  const slots: string[] = [];

  for (let t = start; t + serviceDurationMinutes <= end; t += interval) {
    if (!overlapsBreak(t, serviceDurationMinutes, schedule.breaks)) {
      slots.push(minutesToTime(t));
    }
  }

  return slots;
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
  schedule: Schedule,
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + serviceDurationMinutes;
  const interval = schedule.slotIntervalMinutes;

  return blockedSlots.some((b) => {
    if (b.date !== date) return false;
    // A blocked time occupies [blockStart, blockStart+interval)
    const bStart = timeToMinutes(b.time);
    const bEnd = bStart + interval;
    return slotStart < bEnd && slotEnd > bStart;
  });
}
