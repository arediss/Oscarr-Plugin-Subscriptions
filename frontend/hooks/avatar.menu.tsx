import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { api, type Subscription, type Tier } from '../api';

interface Props {
  context?: { user?: { id?: number } };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function SubscriptionAvatarEntry({ context }: Props) {
  const [state, setState] = useState<{ sub: Subscription | null; tier: Tier | null } | null>(null);

  useEffect(() => {
    const userId = context?.user?.id;
    if (!userId) return;
    let cancelled = false;
    api
      .me()
      .then(({ subscription, tier }) => {
        if (!cancelled) setState({ sub: subscription, tier });
      })
      .catch(() => {
        if (!cancelled) setState({ sub: null, tier: null });
      });
    return () => {
      cancelled = true;
    };
  }, [context?.user?.id]);

  if (!state) return null;

  const { sub, tier } = state;

  if (!sub || !tier) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ndp-text-dim border-t border-white/5">
        <Coins className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">No subscription</span>
      </div>
    );
  }

  const expired = !!sub.expiredAt || new Date(sub.expiresAt).getTime() <= Date.now();
  const primaryTone = expired ? 'text-ndp-danger' : 'text-ndp-text';
  const secondaryTone = expired ? 'text-ndp-danger/70' : 'text-ndp-text-dim';
  const primaryLabel = tier.name;
  const secondaryLabel = expired
    ? `expired ${formatDate(sub.expiresAt)}`
    : `until ${formatDate(sub.expiresAt)}`;

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-t border-white/5">
      <Coins className={`w-4 h-4 flex-shrink-0 ${expired ? 'text-ndp-danger' : 'text-ndp-text-muted'}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${primaryTone}`}>{primaryLabel}</div>
        <div className={`text-xs truncate ${secondaryTone}`}>{secondaryLabel}</div>
      </div>
    </div>
  );
}
