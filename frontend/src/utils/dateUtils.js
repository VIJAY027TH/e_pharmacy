/**
 * Utility for parsing and formatting timestamps returned by the backend API.
 *
 * Backend/Railway timestamps are stored and calculated in UTC, but Spring Boot's
 * default Jackson serializer outputs LocalDateTime strings without a timezone
 * designator (e.g., "2026-10-05T02:52:00").
 *
 * ECMAScript specifies that ISO date-time strings without an explicit timezone
 * are interpreted in local time. This helper ensures that timezone-naive ISO
 * strings from the server are properly treated as UTC before being presented
 * in the client browser's local timezone.
 */

/**
 * Parses a server date/time value into a JavaScript Date.
 * 
 * 1. If value is null, undefined, or empty, returns null.
 * 2. If the value already includes a timezone indicator ('Z', '+HH:mm', '-HH:mm'),
 *    it is parsed as-is.
 * 3. If it is an ISO timestamp with no timezone/offset, 'Z' is appended so
 *    the browser treats it as UTC.
 * 4. Returns the resulting Date object, or null if invalid.
 *
 * @param {string|Date|number|null|undefined} dateStr
 * @returns {Date|null}
 */
export function parseServerDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    return Number.isNaN(dateStr.getTime()) ? null : dateStr;
  }

  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // Preserve existing timezone indicator (Z or offset like +05:30, -04:00, +0500)
  const hasTimezone = /[zZ]$|[+-]\d{2}(?::?\d{2})?$/.test(trimmed);
  if (hasTimezone) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Normalize date-time string (convert space to T if needed) and append UTC designator 'Z'
  let normalized = trimmed;
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(normalized)) {
    normalized = normalized.replace(/\s+/, 'T');
  }

  const d = new Date(normalized + 'Z');
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a server date/time value using the user's local locale and timezone.
 *
 * @param {string|Date|number|null|undefined} dateStr
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatServerDateTime(dateStr, options = { dateStyle: 'medium', timeStyle: 'short' }) {
  const d = parseServerDate(dateStr);
  if (!d) return '—';
  return d.toLocaleString([], options);
}

/**
 * Formats a server date value (date-only) using the user's local locale and timezone.
 *
 * @param {string|Date|number|null|undefined} dateStr
 * @returns {string}
 */
export function formatServerDate(dateStr) {
  const d = parseServerDate(dateStr);
  if (!d) return '—';
  return d.toLocaleDateString();
}
