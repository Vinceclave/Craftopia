// apps/web/src/components/shared/PageHeader.tsx
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  icon: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B4A2F] font-poppins">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 text-sm font-nunito">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

interface ExportButtonsProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  pdfText?: string;
  excelText?: string;
}

export function ExportButtons({
  onExportPDF,
  onExportExcel,
  pdfText = 'Export PDF',
  excelText = 'Export Excel',
}: ExportButtonsProps) {
  return (
    <>
      {onExportPDF && (
        <Button
          onClick={onExportPDF}
          variant="outline"
          className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {pdfText}
        </Button>
      )}
      {onExportExcel && (
        <Button
          onClick={onExportExcel}
          variant="outline"
          className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {excelText}
        </Button>
      )}
    </>
  );
}