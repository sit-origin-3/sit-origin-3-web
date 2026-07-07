export function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) {
    return "";
  }
  const str = String(cell);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(headers: string[], rows: any[][]): string {
  const headerRow = headers.map(escapeCsvCell).join(",");
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(","));
  return [headerRow, ...dataRows].join("\n");
}

export function downloadCsv(filename: string, csvContent: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
