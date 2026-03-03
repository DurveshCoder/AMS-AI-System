import * as XLSX from 'xlsx';

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  const headers = [
    'Asset Name', 'Description', 'Serial Number', 'Status', 'Purchase Date',
    'Purchase Price', 'Warranty Expiry Date', 'Branch', 'Brand', 'Supplier',
    'Asset Type', 'Quantity', 'Tags', 'Assigned To', 'Location',
    'Company Policy Notes', 'Unit',
  ];

  const exampleRow = [
    'Dell Latitude 5520', 'Business laptop with 16GB RAM', 'LPT-20240001',
    'ACTIVE', '2024-01-15', 85000, '2027-01-15', 'HQ Mumbai', 'Dell',
    'TechWorld Solutions Pvt Ltd', 'Laptop', 1, 'IT,Office', 'Admin User',
    'Floor 3, Desk 42', 'Standard IT policy applies', 'Unit',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

  // Set column widths
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 15) }));

  XLSX.utils.book_append_sheet(wb, ws, 'Assets');

  // Instructions sheet
  const instructions = [
    ['AMS Import Template - Instructions'],
    [''],
    ['Column', 'Required', 'Format', 'Notes'],
    ['Asset Name', 'Yes', 'Text', 'Name of the asset'],
    ['Description', 'No', 'Text', 'Optional description'],
    ['Serial Number', 'No', 'Text', 'Unique serial/model number'],
    ['Status', 'No', 'Text', 'ACTIVE, INACTIVE, UNDER_MAINTENANCE, DISPOSED'],
    ['Purchase Date', 'Yes', 'Date (YYYY-MM-DD)', 'Date when asset was purchased'],
    ['Purchase Price', 'Yes', 'Number', 'Amount in INR (no symbols)'],
    ['Warranty Expiry Date', 'No', 'Date (YYYY-MM-DD)', 'Warranty end date'],
    ['Branch', 'No', 'Text', 'Auto-creates if not found'],
    ['Brand', 'No', 'Text', 'Auto-creates if not found'],
    ['Supplier', 'No', 'Text', 'Auto-creates if not found'],
    ['Asset Type', 'No', 'Text', 'Auto-creates with default depreciation if not found'],
    ['Quantity', 'No', 'Number', 'Defaults to 1'],
    ['Tags', 'No', 'Text', 'Comma-separated tags'],
    ['Assigned To', 'No', 'Text', 'User name'],
  ];

  const wsInst = XLSX.utils.aoa_to_sheet(instructions);
  wsInst['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsInst, 'Instructions');

  XLSX.writeFile(wb, 'AMS_Import_Template.xlsx');
}

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  filename: string
) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === null || val === undefined) return '';
      if (typeof val === 'number') return val;
      return String(val);
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 12) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCsv(
  data: Record<string, unknown>[],
  columns: { key: string; header: string }[],
  filename: string
) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') ? `"${str}"` : str;
    })
  );

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
