import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ConnectivityStatus, LanguageCode } from '../../types';
import { translations } from '../../lib/i18n';

interface ConnectivityBadgeProps {
  status: ConnectivityStatus;
  lang: LanguageCode;
  onSyncTrigger?: () => void;
}

export const ConnectivityBadge: React.FC<ConnectivityBadgeProps> = ({
  status,
  lang,
  onSyncTrigger,
}) => {
  const t = translations[lang];

  switch (status) {
    case 'CONNECTED':
      return (
        <div
          id="conn-badge-connected"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-medium"
          title="Internet connection is active and stable"
          role="status"
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>{t.statusConnected}</span>
        </div>
      );

    case 'SYNCING':
      return (
        <div
          id="conn-badge-syncing"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium animate-pulse"
          role="status"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" aria-hidden="true" />
          <span>{t.statusSyncing}</span>
        </div>
      );

    case 'OFFLINE':
      return (
        <div
          id="conn-badge-offline"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-300 text-xs font-medium"
          role="status"
        >
          <WifiOff className="w-3.5 h-3.5 text-stone-600" aria-hidden="true" />
          <span>{t.statusOffline}</span>
          {onSyncTrigger && (
            <button
              onClick={onSyncTrigger}
              className="ml-1 underline hover:text-teal-800"
              title="Attempt to reconnect and sync"
            >
              Sync
            </button>
          )}
        </div>
      );

    case 'SYNCED':
    default:
      return (
        <div
          id="conn-badge-synced"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium"
          role="status"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{t.statusSynced}</span>
        </div>
      );
  }
};
