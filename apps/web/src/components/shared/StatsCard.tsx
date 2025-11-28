// apps/web/src/components/shared/StatsCard.tsx
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  color = 'text-[#2B4A2F]',
  trend,
  subtitle,
}: StatsCardProps) {
  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500 font-nunito">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold ${color} font-poppins`}>{value}</p>
              {trend && (
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-gray-400 font-nunito">{subtitle}</p>}
          </div>
          <div
            className={`p-2 rounded-lg bg-gradient-to-br from-[#6CAC73]/10 to-[#2B4A2F]/10 ${color}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: Array<Omit<StatsCardProps, 'key'>>;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function StatsGrid({
  stats,
  columns = { base: 2, lg: 5 },
}: StatsGridProps) {
  const getGridCols = () => {
    const cols = [];
    if (columns.base) cols.push(`grid-cols-${columns.base}`);
    if (columns.sm) cols.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    return cols.join(' ');
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}