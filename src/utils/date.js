const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** '2026-09-19' -> Date at local midnight */
export const parseDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const isWithinRange = (date, start, end) => {
  const time = startOfDay(date).getTime();
  return time >= startOfDay(start).getTime() && time <= startOfDay(end).getTime();
};

/** Date -> 'Sep 19' */
export const formatShortDate = (date) => `${MONTHS[date.getMonth()]} ${date.getDate()}`;

/** Date -> 'Sat, Sep 19' */
export const formatHeaderDate = (date) => `${WEEKDAYS[date.getDay()]}, ${formatShortDate(date)}`;

/** ('2026-09-19', '2026-09-25') -> 'Sep 19 - Sep 25' */
export const formatRange = (startIso, endIso) =>
  `${formatShortDate(parseDate(startIso))} - ${formatShortDate(parseDate(endIso))}`;

/** Inclusive number of days in a trip */
export const getTripLength = (startIso, endIso) =>
  Math.round((parseDate(endIso) - parseDate(startIso)) / DAY_MS) + 1;

/** The 7 days (Sun-Sat) of the week containing `date` */
export const getWeekDays = (date) => {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
};

const NUMBER_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

/** ('2026-09-19', '2026-09-23') -> 'Sep 19 – Sep 23, 2026' */
export const formatLongRange = (startIso, endIso) => {
  const end = parseDate(endIso);
  return `${formatShortDate(parseDate(startIso))} – ${formatShortDate(end)}, ${end.getFullYear()}`;
};

/** '2026-09-19' -> 'Sep 19, 2026 (Sat)' */
export const formatFullDate = (iso) => {
  const date = parseDate(iso);
  return `${formatShortDate(date)}, ${date.getFullYear()} (${WEEKDAYS[date.getDay()]})`;
};

/** ('2026-09-19', '2026-09-19') -> 'Day One' */
export const getDayLabel = (tripStartIso, dateIso) => {
  const number = Math.round((parseDate(dateIso) - parseDate(tripStartIso)) / DAY_MS) + 1;
  return `Day ${NUMBER_WORDS[number - 1] ?? number}`;
};