import type { BlockedSlot, Schedule } from "../types";
import { ALL_WEEKDAYS, isoWeekday } from "./blockRules";
import { generateTimeSlots, getScheduleSegmentForDay } from "./scheduleUtils";

export interface BlockForm {
  date: string;
  endDate: string;
  time: string;
  endTime: string;
  allDay: boolean;
  weekdays: number[];
}

export function validateBlockForm(form: BlockForm): string | null {
  const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
  if (!validDate(form.date) || !validDate(form.endDate) || form.endDate < form.date)
    return "Seleccioná un rango de fechas válido.";
  if (!form.weekdays.length || new Set(form.weekdays).size !== form.weekdays.length ||
      form.weekdays.some(day => !ALL_WEEKDAYS.includes(day)))
    return "Seleccioná al menos un día de la semana.";
  if (!form.allDay && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.endTime) || form.endTime < form.time))
    return "Seleccioná un rango horario válido.";
  return null;
}

export function blockFormFromRecord(block: BlockedSlot): BlockForm {
  return { date: block.date, endDate: block.endDate ?? block.date,
    time: block.time, endTime: block.endTime ?? block.time,
    allDay: block.allDay ?? false, weekdays: [...(block.weekdays ?? ALL_WEEKDAYS)] };
}

export function buildBlockRule(form: BlockForm, schedule: Schedule,
  isOccupied: (date: string, time: string, duration: number) => boolean): Omit<BlockedSlot, "id"> {
  const error = validateBlockForm(form);
  if (error) throw new Error(error);
  const weeklySlots: NonNullable<BlockedSlot["weeklySlots"]> = {};
  for (const day of ALL_WEEKDAYS) {
    const segment = getScheduleSegmentForDay(schedule, day % 7);
    weeklySlots[String(day)] = generateTimeSlots(segment, segment.slotIntervalMinutes)
      // Preserve the existing inclusive final slot and frozen working schedule.
      .filter(time => form.allDay || (time >= form.time && time <= form.endTime))
      .map(time => ({ time, duration: segment.slotIntervalMinutes }));
  }
  const excludedSlots: string[] = [];
  let availableSlots = 0;
  const cursor = new Date(`${form.date}T00:00:00Z`);
  const endTimestamp = new Date(`${form.endDate}T00:00:00Z`).getTime();
  while (cursor.getTime() <= endTimestamp) {
    const date = cursor.toISOString().slice(0, 10);
    if (form.weekdays.includes(isoWeekday(date))) {
      for (const slot of weeklySlots[String(isoWeekday(date))]) {
        if (isOccupied(date, slot.time, slot.duration)) excludedSlots.push(`${date}__${slot.time}`);
        else availableSlots++;
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  if (availableSlots === 0) throw new Error("No hay horarios disponibles para bloquear en ese rango (ya bloqueados, con turnos o fuera del horario laboral).");
  return { ...form, weekdays: [...form.weekdays].sort((a, b) => a - b), weeklySlots, excludedSlots };
}
