// Shared sizing for every header control so the boxes always line up.
const glass =
  'bg-white/15 hover:bg-white/25 ring-1 ring-white/25 backdrop-blur-md shadow-sm shadow-black/10 transition-colors duration-200';

// Info boxes (search, clock, study time): identical height, width follows the content.
export const headerBox = `flex items-center gap-2 h-10 sm:h-11 shrink-0 rounded-xl px-3 ${glass}`;

// Round icon buttons (alarm, timer, voice, theme).
export const headerIconBtn = `grid place-items-center h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full ${glass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-600 active:scale-95`;

// Bare icon inside an info box (no tile behind it).
export const headerBadge = 'grid place-items-center shrink-0';
