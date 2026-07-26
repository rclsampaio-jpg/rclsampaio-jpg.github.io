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
