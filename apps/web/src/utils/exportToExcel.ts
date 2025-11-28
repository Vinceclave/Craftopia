import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string = 'report') => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  
  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}-${new Date().getTime()}.xlsx`);
};