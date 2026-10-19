// The visitor total is shown like an odometer: six digits, 000000, 000001, 000002... A seventh digit appears on its own after 999999.

export function odometer(n: number, digits = 6): string {
  const whole = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  return String(whole).padStart(digits, '0');
}
