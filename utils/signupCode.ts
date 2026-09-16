export const RESEND_COOLDOWN_MS = 60_000;

export function resendRemainingSeconds(
  sentAt: number,
  now: number,
  cooldownMs: number = RESEND_COOLDOWN_MS,
): number {
  const remainingMs = sentAt + cooldownMs - now;
  return remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 1000);
}

export function sanitizeCodeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function isSixDigitCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}
