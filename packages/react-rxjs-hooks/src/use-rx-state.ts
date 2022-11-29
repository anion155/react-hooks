import type { SetStateDispatcher } from "@anion155/react-hooks";

import {
  useRxStore,
  useRxStoreDispatcher,
  useRxStoreValue,
} from "./use-rx-store";
import type { ReactRxStore, ReactRxStoreInput } from "./utils";

export function useRxState<T>(
  storeInitial: ReactRxStoreInput<T>
): [value: T, dispatcher: SetStateDispatcher<T>, store: ReactRxStore<T>] {
  const store = useRxStore(storeInitial);
  const value = useRxStoreValue(store);
  const dispatcher = useRxStoreDispatcher(store);

  return [value, dispatcher, store];
}
