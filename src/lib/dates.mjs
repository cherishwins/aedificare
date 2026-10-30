/**
 * An edition's date is a day in the author's own time zone (SITE.timeZone,
 * America/Vancouver). Search engines and feeds want an instant with its
 * offset, so a date with no time is set at 00:00 there, and the offset is
 * the one that zone keeps on that day, computed by Intl, never typed: a
 * typed -07:00 is wrong for every date after the first Sunday of November.
 * Midnight is never inside a DST change there (they happen at 02:00), so the
 * offset at midnight is the day's opening offset.
 */
import { SITE } from '../config.mjs';

const pad = (n) => String(n).padStart(2, '0');

/** Minutes east of UTC that `zone` keeps at the instant `t` (ms). */
const offsetAt = (t, zone) => {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(t)).find((p) => p.type === 'timeZoneName').value; // "GMT-07:00", or "GMT" at zero
  const m = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0;
};

/** The instant (ms) of 00:00 on `date` (YYYY-MM-DD) in `zone`, and the offset kept then, in minutes. */
const midnight = (date, zone = SITE.timeZone) => {
  const [y, mo, d] = date.split('-').map(Number);
  const utc = Date.UTC(y, mo - 1, d);
  let off = offsetAt(utc, zone);
  let t = utc - off * 60000;
  const again = offsetAt(t, zone);
  if (again !== off) { off = again; t = utc - off * 60000; }
  return { t, off };
};

const sign = (off, colon) => `${off < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(off) / 60))}${colon ? ':' : ''}${pad(Math.abs(off) % 60)}`;

/** ISO 8601 with the zone's offset: "2026-10-18T00:00:00-07:00". A value that already carries a time is returned as is. */
export const zoned = (date) => {
  if (date.includes('T')) return date;
  return `${date}T00:00:00${sign(midnight(date).off, true)}`;
};

/** RFC 822 with the zone's offset, for RSS: "Sun, 18 Oct 2026 00:00:00 -0700". */
export const rfc822 = (date) => {
  const { off } = midnight(date);
  const [y, mo, d] = date.split('-').map(Number);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mo - 1];
  return `${day}, ${pad(d)} ${mon} ${y} 00:00:00 ${sign(off, false)}`;
};

/** The instant of 00:00 on `date` in the zone, as a Date. */
export const instant = (date) => new Date(midnight(date).t);
