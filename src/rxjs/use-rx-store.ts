import { useSyncExternalStore } from "use-sync-external-store/shim";

import { useConst, useRenderEffect } from "../index";

import type { ReactRxStore, ReactRxStoreInput } from "./react-rx-store";
import { createReactRxStore } from "./react-rx-store";

export function useRxStore<T>(initial: ReactRxStoreInput<T>) {
  const store = useConst(() => createReactRxStore(initial));
  useRenderEffect(() => () => store.complete(), [store]);

  return store;
}

export function useRxStoreValue<T>(store: ReactRxStore<T>) {
  return useSyncExternalStore(store.reactSubscription, store.getValue);
}
