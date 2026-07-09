export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const escape = (value: string | number | null | undefined): string => {
    let s = value === null || value === undefined ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(s)) {
      s = `'${s}`;
    }
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}
