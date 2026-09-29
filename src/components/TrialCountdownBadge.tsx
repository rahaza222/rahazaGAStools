import React from 'react';
import { Clock, Crown, AlertTriangle } from 'lucide-react';
import { LicenseStatus } from '../lib/license';

interface TrialCountdownBadgeProps {
  licenseStatus: LicenseStatus;
  onClick?: () => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const TrialCountdownBadge: React.FC<TrialCountdownBadgeProps> = ({
  licenseStatus,
  onClick,
  className = '',
  variant = 'compact',
}) => {
  // Lifetime PRO
  if (licenseStatus.tier === 'pro_lifetime') {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-2xs cursor-pointer hover:opacity-95 transition-opacity ${className}`}
      >
        <Crown className="w-3.5 h-3.5" />
        <span>PRO LIFETIME</span>
      </button>
    );
  }

  // Expired State
  if (licenseStatus.isExpired) {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-rose-100 transition-colors ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        <span>TRIAL HABIS</span>
      </button>
    );
  }

  // Active Trial State
  const remaining = licenseStatus.trial.remainingSeconds;
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isUrgent = hours < 2;

  return (
    <button
      onClick={onClick}
      type="button"
      title="Klik untuk melihat status lisensi atau upgrade ke PRO Lifetime"
      className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
        isUrgent
          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100'
          : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
      } ${className}`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-600 animate-pulse' : 'text-indigo-600'}`} />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700">
          TRIAL PRO:
        </span>
        <span className="font-mono tabular-nums text-xs font-bold text-gray-900">
          {formattedTime}
        </span>
      </div>
    </button>
  );
};
