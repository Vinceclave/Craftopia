// apps/web/src/utils/exportToPDF.ts - FIXED
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  title?: string;
  filename?: string;
}

// Define colors as RGB tuples to ensure they have exactly 3 numbers
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

export const exportToPDF = (data: any[], filename: string = 'users-report', options: ExportOptions = {}) => {
  try {
    const { 
      title = 'Users Report'
    } = options;
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add simple header
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 10);

    // Report info
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text.secondary);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total Users: ${data.length}`, 14, 20);

    // If no data
    if (data.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.text.secondary);
      doc.text('No user data available', 14, 40);
      doc.save(`${filename}.pdf`);
      return;
    }

    // Prepare table data - focus on essential user information
    const tableHeaders = ['Username', 'Email', 'Role', 'Status', 'Joined', 'Posts', 'Comments', 'Points'];
    
    const tableData = data.map(user => [
      user.username || '',
      user.email || '',
      user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '',
      user.is_active ? 'Active' : 'Banned',
      user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      user._count?.posts?.toString() || '0',
      user._count?.comments?.toString() || '0',
      user.profile?.points?.toString() || '0'
    ]);

    // Create the main table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 25,
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
      margin: { top: 25 },
      theme: 'grid',
      // Removed invalid 'tableLine' property
      didDrawPage: (data) => {
        // Page footer
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text.secondary);
        doc.text(
          `Page ${data.pageNumber}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Save PDF
    doc.save(`${filename}-${new Date().getTime()}.pdf`);
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to generate PDF: ' + (error as Error).message);
  }
};

// Simple user list export
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