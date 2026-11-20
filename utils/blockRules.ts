import type { BlockedSlot } from "../types";

export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

// Calendar arithmetic only: never parse a date-only string as a local instant.
export function isoWeekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
}

export function blockAppliesOnDate(block: BlockedSlot, date: string): boolean {
  return date >= block.date && date <= (block.endDate ?? block.date) &&
    (block.weekdays == null || block.weekdays.includes(isoWeekday(date)));
}

export function blockWindows(block: BlockedSlot, date: string, legacyInterval: number) {
  if (!blockAppliesOnDate(block, date)) return [];
  const slots = block.weeklySlots
    ? block.weeklySlots[String(isoWeekday(date))] ?? []
    : [{ time: block.time, duration: legacyInterval }];
  return slots.filter(slot => !block.excludedSlots?.includes(`${date}__${slot.time}`));
}

export function blockOverlaps(block: BlockedSlot, date: string, time: string, duration: number, legacyInterval: number): boolean {
  const minutes = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  const start = minutes(time);
  return blockWindows(block, date, legacyInterval).some(slot =>
    start < minutes(slot.time) + slot.duration && start + duration > minutes(slot.time));
}

export function weekdayLabel(block: BlockedSlot): string {
  return block.weekdays == null || block.weekdays.length === 7
    ? "Todos los días"
    : block.weekdays.map(day => WEEKDAYS[day - 1]).join(", ");
}

export function blockKeysInRange(block: BlockedSlot, from: string, to: string,
  allDay: boolean, timeFrom: string, timeTo: string): string[] {
  const keys: string[] = [];
  const cursor = new Date(`${from > block.date ? from : block.date}T00:00:00Z`);
  const end = to < (block.endDate ?? block.date) ? to : (block.endDate ?? block.date);
  const endTimestamp = new Date(`${end}T00:00:00Z`).getTime();
  while (cursor.getTime() <= endTimestamp) {
    const date = cursor.toISOString().slice(0, 10);
    for (const slot of blockWindows(block, date, 0)) {
      if (allDay || (slot.time >= timeFrom && slot.time <= timeTo)) keys.push(`${date}__${slot.time}`);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}
