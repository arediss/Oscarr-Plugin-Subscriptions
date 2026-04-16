import type { PluginContext } from './types.js';

interface PlexShareEntry {
  plexUserId: number;
  shareId: number;
}

const HEADERS_BASE = {
  'X-Plex-Client-Identifier': 'oscarr-plugin-subscription',
  'X-Plex-Product': 'Oscarr',
  'X-Plex-Version': '1.0.0',
};

function sharesUrl(machineId: string): string {
  return 'https://plex.tv/api/servers/' + encodeURIComponent(machineId) + '/shared_servers';
}

function shareUrl(machineId: string, shareId: number): string {
  return sharesUrl(machineId) + '/' + encodeURIComponent(String(shareId));
}

async function fetchPlexShares(token: string, machineId: string): Promise<PlexShareEntry[]> {
  const res = await fetch(sharesUrl(machineId), {
    headers: { ...HEADERS_BASE, 'X-Plex-Token': token, Accept: 'application/xml' },
  });
  if (!res.ok) throw new Error('Plex shared_servers GET failed: ' + res.status);
  const xml = await res.text();

  const out: PlexShareEntry[] = [];
  const seen = new Set<number>();
  const regex = /<SharedServer\s[^>]*?>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const tag = match[0];
    const attr = (name: string): string => {
      const m = tag.match(new RegExp(name + '="([^"]*)"'));
      return m ? m[1] : '';
    };
    const plexUserId = parseInt(attr('userID'), 10);
    const shareId = parseInt(attr('id'), 10);
    if (!plexUserId || !shareId || seen.has(plexUserId)) continue;
    seen.add(plexUserId);
    out.push({ plexUserId, shareId });
  }
  return out;
}

export interface PlexOps {
  token: string;
  machineId: string;
}

export async function resolvePlexOps(ctx: PluginContext): Promise<PlexOps | null> {
  const serviceConfig = await ctx.getServiceConfigRaw('plex');
  const token = typeof serviceConfig?.token === 'string' ? serviceConfig.token : null;

  const appSettings = await ctx.getAppSettings();
  let machineId = typeof appSettings.plexMachineId === 'string' ? appSettings.plexMachineId : null;
  if (!machineId && typeof serviceConfig?.machineId === 'string') {
    machineId = serviceConfig.machineId;
  }

  if (!token || !machineId) return null;
  return { token, machineId };
}

export async function unsharePlexUser(
  ctx: PluginContext,
  userId: number,
  ops: PlexOps
): Promise<boolean> {
  const providers = await ctx.getUserProviders(userId);
  const plexLink = providers.find((p) => p.provider === 'plex');
  if (!plexLink?.providerId) {
    ctx.log.info('[Subscription] Plex unshare skipped — user ' + userId + ' has no linked Plex account');
    return false;
  }

  const targetPlexId = parseInt(plexLink.providerId, 10);
  if (!Number.isFinite(targetPlexId)) {
    ctx.log.warn('[Subscription] Plex unshare skipped — user ' + userId + ' providerId is not a number: ' + plexLink.providerId);
    return false;
  }

  const shares = await fetchPlexShares(ops.token, ops.machineId);
  const match = shares.find((s) => s.plexUserId === targetPlexId);
  if (!match) {
    ctx.log.info('[Subscription] Plex unshare skipped — user ' + userId + ' (plex id ' + targetPlexId + ') is not currently in shared_servers');
    return false;
  }
  if (!match.shareId) {
    ctx.log.warn('[Subscription] Plex unshare aborted — found share for user ' + userId + ' but Plex response had no share id attribute');
    return false;
  }

  const del = await fetch(shareUrl(ops.machineId, match.shareId), {
    method: 'DELETE',
    headers: { ...HEADERS_BASE, 'X-Plex-Token': ops.token },
  });
  if (!del.ok) throw new Error('Plex shared_servers DELETE failed: ' + del.status);
  return true;
}
