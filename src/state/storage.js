import { decodeState, encodeState } from './trips.js';
export const STORAGE_KEY = '@at-byahe/state-v1';
export function createTripStorage(storage) {
  let loaded = false;
  let queue = Promise.resolve();
  return {
    async load() {
      const state = decodeState(await storage.getItem(STORAGE_KEY));
      loaded = true;
      return state;
    },
    save(state) {
      if (!loaded) return Promise.reject(new Error('Saved trips must be loaded before saving.'));
      const payload = encodeState(state);
      // Sequential writes prevent an older snapshot from replacing a newer one.
      const write = queue.catch(() => {}).then(() => storage.setItem(STORAGE_KEY, payload));
      queue = write;
      return write;
    },
  };
}
