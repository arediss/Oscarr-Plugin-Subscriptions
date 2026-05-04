import { useEffect, useState } from 'react';
import { Coins, CalendarClock, AlertCircle } from 'lucide-react';
import { api, type Subscription, type Tier } from '../api';

interface Props {
  context?: {
    user?: { id?: number };
    hasPermission?: (p: string) => boolean;
    close?: () => void;
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function daysBetween(target: Date, ref: Date): number {
  const ms = target.getTime() - ref.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export default function SubscriptionAccountSection({ context }: Props) {
  const [state, setState] = useState<{ sub: Subscription | null; tier: Tier | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = context?.user?.id;
    if (!userId) return;
    let cancelled = false;
    api.me()
      .then(({ subscription, tier }) => {
        if (cancelled) return;
        setState({ sub: subscription, tier });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load subscription');
        setState({ sub: null, tier: null });
      });
    return () => { cancelled = true; };
  }, [context?.user?.id]);

  if (!state) {
    return <div className="text-sm text-ndp-text-dim">Loading…</div>;
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-ndp-danger/10 border border-ndp-danger/20 text-sm text-ndp-danger">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{error}</div>
      </div>
    );
  }

  const { sub, tier } = state;

  if (!sub || !tier) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="w-12 h-12 rounded-full bg-ndp-text-dim/10 flex items-center justify-center text-ndp-text-dim flex-shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-ndp-text">No active subscription</p>
            <p className="text-xs text-ndp-text-dim mt-0.5">You're on the standard plan.</p>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const expires = new Date(sub.expiresAt);
  const expired = !!sub.expiredAt || expires.getTime() <= now.getTime();
  const daysLeft = expired ? 0 : daysBetween(expires, now);
  const expiringSoon = !expired && daysLeft <= 7;

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 p-5 rounded-2xl border ${
        expired
          ? 'bg-ndp-danger/10 border-ndp-danger/20'
          : expiringSoon
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-ndp-accent/10 border-ndp-accent/20'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          expired ? 'bg-ndp-danger/20 text-ndp-danger'
          : expiringSoon ? 'bg-amber-500/20 text-amber-400'
          : 'bg-ndp-accent/20 text-ndp-accent'
        }`}>
          <Coins className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-ndp-text">{tier.name}</p>
          <p className="text-xs text-ndp-text-dim mt-0.5">
            {tier.priceLabel} · {tier.durationDays} days
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.02] border border-white/5 divide-y divide-white/5">
        <div className="flex items-center gap-3 px-5 py-4">
          <CalendarClock className="w-4 h-4 text-ndp-text-dim flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ndp-text-dim">Started</p>
            <p className="text-sm text-ndp-text">{formatDate(sub.startedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <CalendarClock className={`w-4 h-4 flex-shrink-0 ${expired ? 'text-ndp-danger' : 'text-ndp-text-dim'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ndp-text-dim">{expired ? 'Expired on' : 'Expires on'}</p>
            <p className={`text-sm ${expired ? 'text-ndp-danger' : 'text-ndp-text'}`}>
              {formatDate(sub.expiresAt)}
              {!expired && (
                <span className={`ml-2 text-xs ${expiringSoon ? 'text-amber-400' : 'text-ndp-text-dim'}`}>
                  ({daysLeft}d left)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {tier.description && (
        <p className="text-xs text-ndp-text-dim leading-relaxed px-1">{tier.description}</p>
      )}
    </div>
  );
}
