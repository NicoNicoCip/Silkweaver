/**
 * Date & time (GMS `date_*` / `current_*`).
 *
 * A datetime is represented as **epoch milliseconds** (a plain number) — Silkweaver's modernized
 * take on GMS's opaque datetime value. All accessors derive from a JS `Date`, so they're local-time.
 */

const _d = (dt: number): Date => new Date(dt)

// =========================================================================
// Construction / "now"
// =========================================================================

/** The current date and time as a datetime (epoch ms). */
export function date_current_datetime(): number { return Date.now() }

/** Builds a datetime from components (month is 1–12). */
export function date_create_datetime(year: number, month: number, day: number, hour: number, minute: number, second: number): number {
    return new Date(year, month - 1, day, hour, minute, second).getTime()
}

/** Builds a date-only datetime (midnight). */
export function date_create_date(year: number, month: number, day: number): number {
    return new Date(year, month - 1, day).getTime()
}

// =========================================================================
// Accessors
// =========================================================================

export function date_get_year(dt: number): number   { return _d(dt).getFullYear() }
export function date_get_month(dt: number): number   { return _d(dt).getMonth() + 1 }
export function date_get_day(dt: number): number     { return _d(dt).getDate() }
export function date_get_hour(dt: number): number    { return _d(dt).getHours() }
export function date_get_minute(dt: number): number  { return _d(dt).getMinutes() }
export function date_get_second(dt: number): number  { return _d(dt).getSeconds() }
/** Day of week, 0 = Sunday … 6 = Saturday. */
export function date_get_weekday(dt: number): number { return _d(dt).getDay() }
/** Day of the year, 1–366. */
export function date_get_day_of_year(dt: number): number {
    const d = _d(dt)
    const start = new Date(d.getFullYear(), 0, 0).getTime()
    return Math.floor((d.getTime() - start) / 86_400_000)
}

export function current_year(): number    { return new Date().getFullYear() }
export function current_month(): number    { return new Date().getMonth() + 1 }
export function current_day(): number      { return new Date().getDate() }
export function current_hour(): number     { return new Date().getHours() }
export function current_minute(): number   { return new Date().getMinutes() }
export function current_second(): number   { return new Date().getSeconds() }
export function current_weekday(): number  { return new Date().getDay() }

// =========================================================================
// Arithmetic / comparison
// =========================================================================

export function date_inc_year(dt: number, amount: number): number   { const d = _d(dt); d.setFullYear(d.getFullYear() + amount); return d.getTime() }
export function date_inc_month(dt: number, amount: number): number   { const d = _d(dt); d.setMonth(d.getMonth() + amount); return d.getTime() }
export function date_inc_week(dt: number, amount: number): number    { return dt + amount * 7 * 86_400_000 }
export function date_inc_day(dt: number, amount: number): number     { return dt + amount * 86_400_000 }
export function date_inc_hour(dt: number, amount: number): number    { return dt + amount * 3_600_000 }
export function date_inc_minute(dt: number, amount: number): number  { return dt + amount * 60_000 }
export function date_inc_second(dt: number, amount: number): number  { return dt + amount * 1000 }

/** Returns -1, 0, or 1 comparing two datetimes. */
export function date_compare_datetime(dt1: number, dt2: number): number { return dt1 < dt2 ? -1 : dt1 > dt2 ? 1 : 0 }

export function date_second_span(dt1: number, dt2: number): number { return Math.abs(dt2 - dt1) / 1000 }
export function date_minute_span(dt1: number, dt2: number): number { return Math.abs(dt2 - dt1) / 60_000 }
export function date_hour_span(dt1: number, dt2: number): number   { return Math.abs(dt2 - dt1) / 3_600_000 }
export function date_day_span(dt1: number, dt2: number): number    { return Math.abs(dt2 - dt1) / 86_400_000 }

// =========================================================================
// Calendar helpers
// =========================================================================

export function date_days_in_month(dt: number): number { const d = _d(dt); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() }
export function date_leap_year(dt: number): boolean {
    const y = _d(dt).getFullYear()
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}
export function date_days_in_year(dt: number): number { return date_leap_year(dt) ? 366 : 365 }

// =========================================================================
// Formatting
// =========================================================================

export function date_datetime_string(dt: number): string { return _d(dt).toLocaleString() }
export function date_date_string(dt: number): string     { return _d(dt).toLocaleDateString() }
export function date_time_string(dt: number): string     { return _d(dt).toLocaleTimeString() }
