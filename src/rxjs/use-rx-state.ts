import type { ReactRxStoreInput } from "./react-rx-store";
import { useRxStore, useRxStoreValue } from "./use-rx-store";

export function useRxState<T>(storeInitial: ReactRxStoreInput<T>) {
  const store = useRxStore(storeInitial);
  const value = useRxStoreValue(store);

  return [value, store.reactDispatch, store] as const;
}
