import { addDays, isWeekend, format, parseISO } from 'date-fns';
import type { AppEvent, EducationLayer } from '../types';

/**
 * Calculates a valid date by skipping weekends and defined events.
 * 
 * @param baseDate The starting date
 * @param offsetDays How many days to add
 * @param events List of events to skip
 * @param targetLayer The education layer to check against event applicability
 * @returns The calculated valid date in YYYY-MM-DD format
 */
export const calculateValidDate = (
  baseDate: Date | string,
  offsetDays: number,
  events: AppEvent[],
  targetLayer: EducationLayer
): string => {
  let currentDate = typeof baseDate === 'string' ? parseISO(baseDate) : baseDate;
  
  // First, add the required offset directly.
  currentDate = addDays(currentDate, offsetDays);

  // Then, shift forward if the landed date is a weekend or an event day.
  let isValid = false;
  while (!isValid) {
    const isWknd = isWeekend(currentDate);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Check if there is an event on this day that applies to the target layer
    const hasEvent = events.some(e => {
      const eStart = e.startDate || e.date;
      const eEnd = e.endDate || e.date;
      
      if (!eStart || !eEnd || dateStr < eStart || dateStr > eEnd) return false;
      
      // If layers array is empty, we assume it applies to all. Otherwise check includes.
      if (!e.layers || e.layers.length === 0) return true;
      return e.layers.includes(targetLayer);
    });

    if (isWknd || hasEvent) {
      currentDate = addDays(currentDate, 1);
    } else {
      isValid = true;
    }
  }

  return format(currentDate, 'yyyy-MM-dd');
};
