import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Truck } from 'lucide-react';
import { DeliveryStatus } from '../types/logistics';

interface StatusBadgeProps {
  status: DeliveryStatus;
}

const STATUS_CONFIG: Record<
  DeliveryStatus,
  {
    label: string;
    classes: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  delivered: {
    label: '배송완료',
    classes: 'text-[#16A34A] bg-[#DCFCE7] border-[#BBF7D0]',
    Icon: CheckCircle2,
  },
  in_transit: {
    label: '배송중',
    classes: 'text-[#C2410C] bg-[#FFEDD5] border-[#FED7AA]',
    Icon: Truck,
  },
  pending: {
    label: '배송대기',
    classes: 'text-[#1E3A8A] bg-[#EFF6FF] border-[#BFDBFE]',
    Icon: Clock,
  },
  issue: {
    label: '이슈/보류',
    classes: 'text-[#DC2626] bg-[#FEE2E2] border-[#FECACA]',
    Icon: AlertTriangle,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold leading-none border rounded-sm whitespace-nowrap shrink-0 ${cfg.classes}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
};

export const KakaoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3C6.477 3 2 6.463 2 10.737c0 2.752 1.832 5.166 4.588 6.533l-.932 3.462a.375.375 0 0 0 .566.414l4.027-2.668c.573.076 1.16.117 1.751.117 5.523 0 10-3.463 10-7.858C22 6.463 17.523 3 12 3z" />
  </svg>
);

interface KakaoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const KakaoButton: React.FC<KakaoButtonProps> = ({
  label,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'h-12 px-4 text-sm'
      : size === 'sm'
      ? 'min-h-[40px] px-3 text-xs'
      : 'h-11 px-3.5 text-sm';

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#F5DC00] active:bg-[#EBD300] text-[#3C1E1E] font-semibold rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${sizeClasses} ${className}`}
      {...props}
    >
      <KakaoIcon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
};
