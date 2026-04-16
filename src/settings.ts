import type { PluginContext, PluginSettings } from './types.js';

const DEFAULTS: PluginSettings = {
  downgradeRoleName: 'user',
  notifyDaysBefore: 7,
  notifyOnExpiration: true,
  autoKickPlex: false,
  autoKickDelayDays: 3,
};

export async function getSettings(ctx: PluginContext): Promise<PluginSettings> {
  const downgrade = (await ctx.getSetting('downgradeRoleName')) as string | undefined;
  const days = (await ctx.getSetting('notifyDaysBefore')) as number | undefined;
  const onExp = (await ctx.getSetting('notifyOnExpiration')) as boolean | undefined;
  const kickOn = (await ctx.getSetting('autoKickPlex')) as boolean | undefined;
  const kickDelay = (await ctx.getSetting('autoKickDelayDays')) as number | undefined;
  return {
    downgradeRoleName: typeof downgrade === 'string' && downgrade ? downgrade : DEFAULTS.downgradeRoleName,
    notifyDaysBefore: typeof days === 'number' && days >= 0 ? days : DEFAULTS.notifyDaysBefore,
    notifyOnExpiration: typeof onExp === 'boolean' ? onExp : DEFAULTS.notifyOnExpiration,
    autoKickPlex: typeof kickOn === 'boolean' ? kickOn : DEFAULTS.autoKickPlex,
    autoKickDelayDays: typeof kickDelay === 'number' && kickDelay >= 0 ? kickDelay : DEFAULTS.autoKickDelayDays,
  };
}
