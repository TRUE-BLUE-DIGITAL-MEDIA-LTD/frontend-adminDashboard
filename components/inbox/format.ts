export function formatSender(
  fromName: string | null | undefined,
  fromAddress: string,
): string {
  return fromName && fromName.trim() !== "" ? fromName : fromAddress;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
