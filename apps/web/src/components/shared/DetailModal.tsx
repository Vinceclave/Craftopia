// apps/web/src/components/shared/DetailModal.tsx
import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export interface DetailSection {
  title: string;
  items: DetailItem[];
}

export interface DetailItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  header?: ReactNode;
  sections: DetailSection[];
  footer?: ReactNode;
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  header,
  sections,
  footer,
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
              {icon}
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="font-nunito">{description}</DialogDescription>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Custom Header Section */}
          {header && (
            <>
              {header}
              <Separator className="bg-[#6CAC73]/20" />
            </>
          )}

          {/* Detail Sections */}
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-4">
              <h4 className="font-semibold text-[#2B4A2F] font-poppins">{section.title}</h4>
              <div className="grid grid-cols-2 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex flex-col gap-2 ${item.fullWidth ? 'col-span-2' : ''}`}
                  >
                    <p className="text-sm text-gray-500 font-nunito flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </p>
                    <div className="text-[#2B4A2F] font-nunito">{item.value}</div>
                  </div>
                ))}
              </div>
              {sectionIndex < sections.length - 1 && (
                <Separator className="bg-[#6CAC73]/20" />
              )}
            </div>
          ))}

          {/* Footer */}
          {footer && (
            <>
              <Separator className="bg-[#6CAC73]/20" />
              {footer}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for creating stat grids in detail modals
interface StatGridProps {
  stats: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    color?: string;
  }>;
  columns?: number;
}

export function DetailStatGrid({ stats, columns = 4 }: StatGridProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10 text-center"
        >
          <div className={`mx-auto mb-2 ${stat.color || 'text-[#6CAC73]'}`}>{stat.icon}</div>
          <p className="text-sm text-gray-500 font-nunito">{stat.label}</p>
          <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}