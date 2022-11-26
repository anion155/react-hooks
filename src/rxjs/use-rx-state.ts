import type { SetStateDispatcher } from "../index";

import type { ReactRxStore, ReactRxStoreInput } from "./react-rx-store";
import {
  useRxStore,
  useRxStoreDispatcher,
  useRxStoreValue,
} from "./use-rx-store";

export function useRxState<T>(
  storeInitial: ReactRxStoreInput<T>
): [value: T, dispatcher: SetStateDispatcher<T>, store: ReactRxStore<T>] {
  const store = useRxStore(storeInitial);
  const value = useRxStoreValue(store);
  const dispatcher = useRxStoreDispatcher(store);

  return [value, dispatcher, store];
}
