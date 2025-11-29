// apps/web/src/utils/exportToPDF.ts - REFACTORED FOR DYNAMIC EXPORTS

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define colors as RGB tuples
const COLORS = {
  primary: [43, 74, 47] as [number, number, number],    // #2B4A2F
  secondary: [108, 172, 115] as [number, number, number], // #6CAC73
  lightGreen: [235, 245, 236] as [number, number, number],
  border: [200, 200, 200] as [number, number, number],
  text: {
    primary: [33, 33, 33] as [number, number, number],
    secondary: [100, 100, 100] as [number, number, number]
  }
};

// Generic table configuration interface
export interface TableColumn {
  header: string;
  dataKey: string;
  formatter?: (value: any, row: any) => string;
  width?: number;
}

export interface ExportStats {
  label: string;
  value: string | number;
}

export interface ExportConfig {
  title: string;
  subtitle?: string;
  stats?: ExportStats[];
  columns: TableColumn[];
  data: any[];
  filename?: string;
}

/**
 * Generic PDF export function that works with any table configuration
 */
export const generateGenericPDF = (config: ExportConfig) => {
  try {
    const { title, subtitle, stats, columns, data, filename = 'report' } = config;

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 0;

    // Add header with gradient effect
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 20, 'F');

    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 12);
    currentY = 25;

    // Subtitle
    if (subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text.secondary);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 14, currentY);
      currentY += 7;
    }

    // Report info
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text.secondary);
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, currentY);
    currentY += 5;
    doc.text(`Total Records: ${data.length}`, 14, currentY);
    currentY += 10;

    // Stats section if provided
    if (stats && stats.length > 0) {
      doc.setFillColor(...COLORS.lightGreen);
      doc.roundedRect(14, currentY, pageWidth - 28, 8 + (Math.ceil(stats.length / 3) * 8), 2, 2, 'F');

      currentY += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.primary);

      const statsPerRow = 3;
      const statWidth = (pageWidth - 28) / statsPerRow;

      stats.forEach((stat, index) => {
        const col = index % statsPerRow;
        const row = Math.floor(index / statsPerRow);
        const x = 14 + (col * statWidth) + 5;
        const y = currentY + (row * 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text.secondary);
        doc.text(stat.label, x, y);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.primary);
        doc.text(String(stat.value), x, y + 4);
      });

      currentY += Math.ceil(stats.length / statsPerRow) * 8 + 5;
    }

    // If no data
    if (data.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.text.secondary);
      doc.text('No data available', 14, currentY + 10);
      doc.save(`${filename}-${new Date().getTime()}.pdf`);
      return;
    }

    // Prepare table data
    const tableHeaders = columns.map(col => col.header);
    const tableData = data.map(row =>
      columns.map(col => {
        const value = row[col.dataKey];
        return col.formatter ? col.formatter(value, row) : String(value ?? '');
      })
    );

    // Create the main table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: COLORS.border,
        lineWidth: 0.1,
        textColor: COLORS.text.primary,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontStyle: 'bold',
        lineWidth: 0.1,
        fontSize: 9,
        lineColor: COLORS.border,
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: COLORS.border,
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGreen,
        lineColor: COLORS.border,
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as any),
      margin: { top: currentY },
      theme: 'grid',
      didDrawPage: (data) => {
        // Page footer
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text.secondary);
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 20,
          doc.internal.pageSize.height - 10
        );

        // Add watermark
        doc.setFontSize(6);
        doc.text(
          'Craftopia Admin Report',
          14,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Save PDF
    doc.save(`${filename}-${new Date().getTime()}.pdf`);

  } catch (error) {
    throw new Error('Failed to generate PDF: ' + (error as Error).message);
  }
};

/**
 * Legacy function for backward compatibility - Users page
 */
export const exportToPDF = (data: any[], filename: string = 'users-report', options: { title?: string } = {}) => {
  const { title = 'Users Report' } = options;

  const config: ExportConfig = {
    title,
    subtitle: 'User Management Report',
    columns: [
      { header: 'Username', dataKey: 'username' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Role', dataKey: 'role', formatter: (val) => val ? val.charAt(0).toUpperCase() + val.slice(1) : '' },
      { header: 'Status', dataKey: 'is_active', formatter: (val) => val ? 'Active' : 'Banned' },
      { header: 'Joined', dataKey: 'created_at', formatter: (val) => val ? new Date(val).toLocaleDateString() : '' },
      { header: 'Posts', dataKey: '_count', formatter: (val) => val?.posts?.toString() || '0' },
      { header: 'Comments', dataKey: '_count', formatter: (val) => val?.comments?.toString() || '0' },
      { header: 'Points', dataKey: 'profile', formatter: (val) => val?.points?.toString() || '0' },
    ],
    data,
    filename,
  };

  return generateGenericPDF(config);
};

/**
 * Simple user list export
 */
export const exportSimpleUserList = (data: any[], filename: string = 'user-list') => {
  const simpleData = data.map(user => ({
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.is_active ? 'Active' : 'Banned',
    joined: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
  }));

  return exportToPDF(simpleData, filename, {
    title: 'User List'
  });
};