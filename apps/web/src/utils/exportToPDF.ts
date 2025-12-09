// apps/web/src/utils/exportToPDF.ts - REFACTORED FOR CLEAN, MINIMALISTIC DESIGN

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define colors as RGB tuples - Modern minimalistic palette
const COLORS = {
  primary: [30, 30, 30] as [number, number, number],      // Dark gray for text
  accent: [59, 130, 246] as [number, number, number],     // Modern blue accent
  background: [249, 250, 251] as [number, number, number], // Light gray background
  border: [229, 231, 235] as [number, number, number],    // Subtle border
  text: {
    primary: [17, 24, 39] as [number, number, number],    // Almost black
    secondary: [107, 114, 128] as [number, number, number], // Medium gray
    muted: [156, 163, 175] as [number, number, number]     // Light gray
  }
};

/**
 * Convert image to base64 data URL
 */
const getLogoDataURL = async (logoPath: string): Promise<string | null> => {
  try {
    const response = await fetch(logoPath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.warn('Logo not found, continuing without logo');
    return null;
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
  logoPath?: string; // Optional logo path
}

/**
 * Generic PDF export function with minimalistic design
 */
export const generateGenericPDF = async (config: ExportConfig) => {
  try {
    const { title, subtitle, stats, columns, data, filename = 'report', logoPath = '/assets/logo.png' } = config;

    // Load logo if available
    const logoDataURL = await getLogoDataURL(logoPath);

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 20;

    // Add logo in top right corner if available
    if (logoDataURL) {
      const logoSize = 12; // Height in mm
      const logoX = pageWidth - 14 - logoSize;
      const logoY = 15;
      
      try {
        doc.addImage(logoDataURL, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
      }
    }

    // Ultra-minimal header - no lines, just typography
    // Title - large and bold
    doc.setFontSize(24);
    doc.setTextColor(...COLORS.text.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, currentY);
    currentY += 6;

    // Subtitle - lighter weight, smaller
    if (subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text.secondary);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 14, currentY);
      currentY += 10;
    } else {
      currentY += 5;
    }

    // Report metadata - very subtle, compact
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text.muted);
    doc.setFont('helvetica', 'normal');
    const metaText = `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    doc.text(metaText, 14, currentY);
    currentY += 4;
    doc.text(`Total Records: ${data.length}`, 14, currentY);
    currentY += 12;

    // Stats section - minimal card design with better proportions
    if (stats && stats.length > 0) {
      // Very subtle background
      doc.setFillColor(255, 255, 255); // Pure white
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      const statsPerRow = Math.min(stats.length, 3); // Max 3 per row for better balance
      const cardHeight = 6 + (Math.ceil(stats.length / statsPerRow) * 14);
      doc.roundedRect(14, currentY, pageWidth - 28, cardHeight, 1.5, 1.5, 'S');

      currentY += 9;
      
      const statWidth = (pageWidth - 28) / statsPerRow;

      stats.forEach((stat, index) => {
        const col = index % statsPerRow;
        const row = Math.floor(index / statsPerRow);
        const x = 14 + (col * statWidth) + 10;
        const y = currentY + (row * 14);

        // Stat label - uppercase and tiny
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.text.muted);
        const label = stat.label.toUpperCase();
        doc.text(label, x, y);

        // Stat value - bold and prominent
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...COLORS.text.primary);
        doc.text(String(stat.value), x, y + 6);
      });

      currentY += Math.ceil(stats.length / statsPerRow) * 14 + 6;
    }

    // If no data
    if (data.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text.muted);
      doc.setFont('helvetica', 'italic');
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

    // Create the main table with minimal styling
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        lineColor: COLORS.border,
        lineWidth: 0,
        textColor: COLORS.text.primary,
        font: 'helvetica',
        fontStyle: 'normal',
      },
      headStyles: {
        fillColor: COLORS.background, // Light gray, not white
        textColor: COLORS.text.secondary,
        fontStyle: 'bold',
        fontSize: 8,
        lineWidth: 0,
        halign: 'left',
        cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
      },
      bodyStyles: {
        lineWidth: 0,
      },
      alternateRowStyles: {
        fillColor: [252, 252, 253], // Very subtle alternating
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as any),
      margin: { top: currentY, left: 14, right: 14 },
      theme: 'plain',
      didDrawPage: (data) => {
        // Add logo to every page header
        if (logoDataURL) {
          const logoSize = 8; // Smaller for page headers
          const logoX = pageWidth - 14 - logoSize;
          const logoY = 8;
          
          try {
            doc.addImage(logoDataURL, 'PNG', logoX, logoY, logoSize, logoSize);
          } catch (error) {
            console.warn('Could not add logo to page:', error);
          }
        }

        // Ultra-minimal footer
        const footerY = doc.internal.pageSize.height - 15;
        
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.text.muted);
        doc.setFont('helvetica', 'normal');
        
        // Page number (right aligned)
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 14,
          footerY,
          { align: 'right' }
        );

        // Document name (left aligned)  
        doc.text(
          title,
          14,
          footerY
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