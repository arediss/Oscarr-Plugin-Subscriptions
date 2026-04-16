export const PERM_TIERS_MANAGE = 'subscription.tiers.manage';
export const PERM_SUBS_MANAGE = 'subscription.subs.manage';

export const PERMISSIONS: Array<{ key: string; description: string }> = [
  { key: PERM_TIERS_MANAGE, description: 'Create, edit and delete subscription tiers' },
  { key: PERM_SUBS_MANAGE, description: 'Assign, revoke and view all user subscriptions' },
];
