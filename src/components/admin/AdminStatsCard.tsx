import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  className?: string;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="mt-1">
                  <div className="text-xs text-gray-500">
                    {subtitle}
                    Hi There
                  </div>
                </dd>
              )}
              {trend?.label && (
                <dd className="mt-1">
                  <div className="text-xs text-gray-400">
                    {trend.label}
                  </div>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCard; 