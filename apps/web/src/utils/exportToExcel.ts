// apps/web/src/utils/exportToExcel.ts - REFACTORED FOR DYNAMIC EXPORTS
import * as XLSX from 'xlsx';

// Generic Excel configuration interface
export interface ExcelColumn {
  header: string;
  dataKey: string;
  formatter?: (value: any, row: any) => string | number;
  width?: number;
}

export interface ExcelSheetConfig {
  sheetName: string;
  columns: ExcelColumn[];
  data: any[];
}

export interface ExcelExportConfig {
  filename?: string;
  sheets: ExcelSheetConfig[];
}

/**
 * Generic Excel export function that supports multiple sheets
 */
export const generateGenericExcel = (config: ExcelExportConfig) => {
  const { filename = 'report', sheets } = config;

  // Create workbook
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const { sheetName, columns, data } = sheet;

    // Prepare data with headers
    const headers = columns.map(col => col.header);
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.dataKey];
        return col.formatter ? col.formatter(value, row) : value ?? '';
      })
    );

    // Create worksheet from array of arrays
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths if specified
    const colWidths = columns.map(col => ({
      wch: col.width || 15 // default width
    }));
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}-${new Date().getTime()}.xlsx`);
};

/**
 * Simple single-sheet Excel export
 */
export const generateSimpleExcel = (
  data: any[],
  columns: ExcelColumn[],
  filename: string = 'report',
  sheetName: string = 'Report'
) => {
  return generateGenericExcel({
    filename,
    sheets: [{
      sheetName,
      columns,
      data
    }]
  });
};

/**
 * Legacy function for backward compatibility
 */
export const exportToExcel = (data: any[], filename: string = 'report') => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}-${new Date().getTime()}.xlsx`);
};