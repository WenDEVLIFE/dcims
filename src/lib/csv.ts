/**
 * CSV serialisation with spreadsheet formula-injection protection.
 *
 * A cell whose text begins with =, +, -, @, tab, or carriage return is treated
 * as a formula by Excel and Sheets. Prefixing an apostrophe keeps the value
 * literal; the leading quote is a display artefact, not part of the data.
 */

const FORMULA_PREFIXES = new Set(["=", "+", "-", "@", "\t", "\r"]);

export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = String(value);
  if (text.length > 0 && FORMULA_PREFIXES.has(text.charAt(0))) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCsvValue).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }
  // CRLF is the safest line ending for Excel.
  return lines.join("\r\n");
}

/**
 * Triggers a download in the browser. Server rendering has no document, so the
 * caller must guard against invoking this outside the browser.
 */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === "undefined") {
    throw new Error("CSV download is only available in the browser");
  }

  // The BOM makes Excel read the file as UTF-8, which matters for the peso sign.
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
