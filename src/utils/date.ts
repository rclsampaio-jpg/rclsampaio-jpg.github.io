/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Returns today's (or a given date's) calendar day as YYYY-MM-DD using the
// browser's LOCAL timezone. `Date#toISOString()` converts to UTC first,
// which silently shifts the date by a day for anyone behind UTC (e.g.
// Brazil, UTC-3) during the hours where local time and UTC fall on
// different calendar days — the app would think "today" was already
// tomorrow. Every "what's today's date" computation in the app must go
// through this helper instead of `new Date().toISOString().slice(0, 10)`.
export function getLocalDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Late-night hours (00:00 up to this hour, exclusive) count as still being
// "yesterday" for day-unlock purposes. Someone who finishes a day at 00h15
// is clearly still in that day's late-night session, not starting a brand
// new one — so the next day should already be open. Someone who finishes at
// a normal hour (e.g. 14h or 22h) is genuinely done for the day and should
// wait for the real next calendar day, so binge-completing every day back
// to back in one sitting is still prevented.
export const LATE_NIGHT_UNLOCK_CUTOFF_HOUR = 6;

// The calendar date to compare against for day-unlock purposes: the real
// local date, unless it's still late night, in which case it's backdated to
// the previous day so the unlock check (`anchorDate === today`) already
// reads as false and the next day opens immediately.
export function getUnlockAnchorDateISO(date: Date = new Date()): string {
  if (date.getHours() < LATE_NIGHT_UNLOCK_CUTOFF_HOUR) {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    return getLocalDateISO(prevDay);
  }
  return getLocalDateISO(date);
}
