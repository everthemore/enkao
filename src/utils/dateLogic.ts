import { addDays, isWeekend, format, parseISO } from 'date-fns';
import type { AppEvent } from '../types';

/**
 * Calculates a valid date by skipping weekends and defined events.
 * 
 * @param baseDate The starting date
 * @param offsetDays How many days to add
 * @param events List of events to skip
 * @returns The calculated valid date in YYYY-MM-DD format
 */
export const calculateValidDate = (
  baseDate: Date | string,
  offsetDays: number,
  events: AppEvent[]
): string => {
  let currentDate = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;
  
  // First, add the required offset directly.
  currentDate = addDays(currentDate, offsetDays);

  // Then, shift forward if the landed date is a weekend or an event day.
  let isValid = false;
  while (!isValid) {
    const isWknd = isWeekend(currentDate);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const hasEvent = events.some(e => e.date === dateStr);

    if (isWknd || hasEvent) {
      currentDate = addDays(currentDate, 1);
    } else {
      isValid = true;
    }
  }

  return format(currentDate, 'yyyy-MM-dd');
};
