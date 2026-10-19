import { Footprints, Lightbulb, Compass, BookOpen, Flame, Mountain, ClipboardCheck, CheckCircle2, Castle, Star, Award, Clock, Layers, Trophy } from 'lucide-react';

const ICONS = { footprints: Footprints, lightbulb: Lightbulb, compass: Compass, book: BookOpen, flame: Flame, mountain: Mountain, clipboard: ClipboardCheck,
  check: CheckCircle2, castle: Castle, star: Star, award: Award, clock: Clock, layers: Layers, level: Trophy } as const;

/** The picture for a badge, chosen by the name the server sends. An unknown name still gets a trophy, never a blank. */
export function BadgeIcon({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Trophy;
  return <Icon aria-hidden="true" className={className} />;
}
