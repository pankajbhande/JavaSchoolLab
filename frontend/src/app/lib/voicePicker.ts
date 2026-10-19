// Chooses the browser voice for "Girl Voice" / "Boy Voice".
//
// The browser only offers the voices installed on the learner's device, and a voice has no gender field, only a name.
// So gender is decided from the name, strictly: a voice is never used for the wrong gender just because its name
// does not say "male". Among the right-gender voices the best one wins: Indian English first, then the neural
// "Natural" / "Online" voices (Edge ships these free and they sound far more human than the old built-in ones).

export type VoiceGender = 'male' | 'female';

export interface VoiceInfo {
  name: string;
  lang: string;
}

const FEMALE = [
  'female', 'woman', 'girl',
  'neerja', 'heera', 'kalpana', 'veena', 'raveena', 'lekha', 'swara', 'aarti', 'priya',
  'zira', 'hazel', 'susan', 'aria', 'jenny', 'sonia', 'libby', 'natasha', 'clara', 'samantha', 'karen', 'tessa', 'moira', 'fiona', 'victoria',
];
const MALE = [
  'male', 'man', 'boy',
  'prabhat', 'ravi', 'hemant', 'madhur', 'rishi', 'raoji', 'prataprao', 'pratap', 'arjun',
  'david', 'mark', 'george', 'guy', 'ryan', 'james', 'daniel', 'alex', 'fred', 'liam', 'thomas', 'oliver',
];

/** Whole-word match, so "man" does not match "woman" and "male" does not match "female". */
function hasWord(name: string, words: string[]): boolean {
  const tokens = name.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  return words.some(w => tokens.includes(w));
}

export function genderOf(name: string): VoiceGender | null {
  const female = hasWord(name, FEMALE);
  const male = hasWord(name, MALE);
  if (female && !male) return 'female';
  if (male && !female) return 'male';
  return null;
}

function quality(v: VoiceInfo): number {
  const lang = (v.lang || '').toLowerCase().replace('_', '-');
  const name = v.name.toLowerCase();
  let score = 0;
  if (lang === 'en-in') score += 100;
  else if (lang.startsWith('en')) score += 20;
  else if (lang === 'hi-in') score += 10;
  else score -= 1000;                         // never read English with a non-English voice
  if (name.includes('natural')) score += 60;   // Edge neural voices
  else if (name.includes('online')) score += 40;
  else if (name.includes('google')) score += 15;
  return score;
}

export interface VoicePick<T extends VoiceInfo> {
  voice: T | undefined;
  /** true when the voice really is the requested gender; false means none was installed and a stand-in was chosen. */
  exact: boolean;
}

export function pickVoice<T extends VoiceInfo>(voices: T[], gender: VoiceGender): VoicePick<T> {
  const usable = voices.filter(v => quality(v) > -500);
  const best = (list: T[]) => [...list].sort((a, b) => quality(b) - quality(a))[0];

  const exact = best(usable.filter(v => genderOf(v.name) === gender));
  if (exact) return { voice: exact, exact: true };

  // No voice of that gender is installed: use the best Indian/English voice of unknown gender, never the opposite gender.
  const unknown = best(usable.filter(v => genderOf(v.name) === null));
  if (unknown) return { voice: unknown, exact: false };

  // Only voices of the other gender exist: leave the choice to the browser rather than use the wrong one.
  return { voice: undefined, exact: false };
}
