/**
 * Converts a date to Unix timestamp (seconds since epoch).
 *
 * @param date - The date to convert. Defaults to current time (Date.now())
 * @returns The Unix timestamp in seconds
 *
 * @example
 * ```typescript
 * toSQL(new Date('2023-01-01')); // Returns Unix timestamp for that date
 * toSQL(); // Returns current Unix timestamp
 * ```
 */
export function toSQL(date = new Date()) {
  return Math.round(date.getTime() / 1000)
}

/**
 * Converts a Unix timestamp to a Date object.
 *
 * @param date - The Unix timestamp in seconds
 * @returns A Date object representing the timestamp
 *
 * @example
 * ```typescript
 * fromSQL(1672531200); // Returns Date object for 2023-01-01
 * ```
 */
export function fromSQL(date: number) {
  return new Date(date * 1000)
}
