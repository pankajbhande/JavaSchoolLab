interface AvatarProps {
  /** Data URL of the photo; when missing the initial-letter circle is shown. */
  src?: string | null;
  name: string;
  /** Tailwind size + text classes, e.g. "w-7 h-7 text-sm". */
  className?: string;
  /** Classes for the fallback circle's colours. */
  fallbackClassName?: string;
}

export function Avatar({ src, name, className = 'w-7 h-7 text-sm', fallbackClassName = 'bg-white text-orange-600' }: AvatarProps) {
  if (src) {
    return <img src={src} alt="" className={`${className} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div aria-hidden="true" className={`${className} ${fallbackClassName} rounded-full grid place-items-center font-bold shrink-0`}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}
