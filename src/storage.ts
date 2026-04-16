import { readFile, writeFile, rename, unlink } from 'fs/promises';
import { join } from 'path';
import type { PluginContext, SubscriptionStoreData } from './types.js';

const FILE_NAME = 'data.json';
const CURRENT_VERSION = 1;

const EMPTY: SubscriptionStoreData = {
  version: CURRENT_VERSION,
  tiers: [],
  subscriptions: {},
};

export class SubscriptionStore {
  private ctx: PluginContext;
  private cache: SubscriptionStoreData | null = null;
  /** Chain used to serialize writes. Always resolves (errors are caught locally and re-thrown to the caller via the returned promise), so a failing mutator never leaves the chain in a rejected state that would break the next caller. */
  private writeChain: Promise<unknown> = Promise.resolve();

  constructor(ctx: PluginContext) {
    this.ctx = ctx;
  }

  private async filePath(): Promise<string> {
    const dir = await this.ctx.getPluginDataDir();
    return join(dir, FILE_NAME);
  }

  async load(): Promise<SubscriptionStoreData> {
    if (this.cache) return this.cache;
    const path = await this.filePath();
    try {
      const raw = await readFile(path, 'utf-8');
      const parsed = JSON.parse(raw) as SubscriptionStoreData;
      const subs = parsed.subscriptions && typeof parsed.subscriptions === 'object' ? parsed.subscriptions : {};
      for (const sub of Object.values(subs)) {
        if ((sub as { plexKickedAt?: unknown }).plexKickedAt === undefined) {
          (sub as { plexKickedAt: string | null }).plexKickedAt = null;
        }
      }
      this.cache = {
        version: parsed.version ?? CURRENT_VERSION,
        tiers: Array.isArray(parsed.tiers) ? parsed.tiers : [],
        subscriptions: subs,
      };
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        this.cache = { ...EMPTY, subscriptions: {}, tiers: [] };
      } else if (err instanceof SyntaxError) {
        const corruptPath = path + '.corrupt-' + Date.now();
        this.ctx.log.error(`[Subscription] data.json is corrupted, moved to ${corruptPath}. Starting with an empty store.`);
        try { await rename(path, corruptPath); } catch { /* best effort */ }
        this.cache = { ...EMPTY, subscriptions: {}, tiers: [] };
      } else {
        throw err;
      }
    }
    return this.cache!;
  }

  /**
   * Runs a mutator under a serialized write lock. Writes are persisted via a
   * tmp-file + rename sequence so a crash mid-write can never leave a truncated
   * data.json. The mutator sees a live reference to the cached object and may
   * mutate it directly; throw to abort the mutation without persisting.
   */
  async mutate(mutator: (data: SubscriptionStoreData) => void | Promise<void>): Promise<SubscriptionStoreData> {
    const run = async (): Promise<SubscriptionStoreData> => {
      const data = await this.load();
      await mutator(data);
      data.version = CURRENT_VERSION;
      const path = await this.filePath();
      const tmpPath = path + '.tmp';
      await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      try {
        await rename(tmpPath, path);
      } catch (renameErr) {
        try { await unlink(tmpPath); } catch { /* ignore */ }
        throw renameErr;
      }
      this.cache = data;
      return data;
    };

    const next = this.writeChain.catch(() => undefined).then(run);
    this.writeChain = next.catch(() => undefined);
    return next;
  }

  async snapshot(): Promise<SubscriptionStoreData> {
    const data = await this.load();
    return JSON.parse(JSON.stringify(data)) as SubscriptionStoreData;
  }
}
