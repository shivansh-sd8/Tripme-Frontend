"use client";
import React from 'react';
import { CreditCard, Gift, Star, TrendingUp, Tag, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';

interface PromotionalCardProps {
  type?: 'credit-card' | 'discount' | 'cashback' | 'bonus';
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code?: string;
  className?: string;
}

const PromotionalCard: React.FC<PromotionalCardProps> = ({
  type = 'credit-card',
  title,
  description,
  discount,
  validUntil,
  code,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'credit-card':
        return <CreditCard className="w-5 h-5" />;
      case 'cashback':
        return <Gift className="w-5 h-5" />;
      case 'discount':
        return <Star className="w-5 h-5" />;
      case 'bonus':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'credit-card':
        return 'bg-gradient-to-br from-blue-500 to-purple-600';
      case 'cashback':
        return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'discount':
        return 'bg-gradient-to-br from-orange-500 to-red-500';
      case 'bonus':
        return 'bg-gradient-to-br from-purple-500 to-pink-600';
      default:
        return 'bg-gradient-to-br from-blue-500 to-purple-600';
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  return (
    <Card className={`${getGradient()} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm leading-tight mb-0.5">{title}</h3>
              <p className="text-xs opacity-90 leading-tight line-clamp-2">{description}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="text-lg font-bold">{discount}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs opacity-90 min-w-0 flex-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Valid until {validUntil}</span>
          </div>
          
          {code && (
            <button
              onClick={() => handleCopyCode(code)}
              className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <Tag className="w-3 h-3" />
              <span className="truncate">{code}</span>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PromotionalCard; 