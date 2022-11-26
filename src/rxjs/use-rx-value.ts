import type { DependencyList } from "react";
import type { BehaviorSubject, ObservableInput } from "rxjs";

import { useRxStore, useRxStoreValue } from "./use-rx-store";
import { useRxSubscription } from "./use-rx-subscription";

export function useRxValue<T>(
  sourceFabric: () => BehaviorSubject<T>,
  deps: DependencyList
): T;
export function useRxValue<T>(
  sourceFabric: () => ObservableInput<T>,
  deps: DependencyList
): T | undefined;
export function useRxValue<T>(
  sourceFabric: () => ObservableInput<T>,
  deps: DependencyList
) {
  const store = useRxStore<T | undefined>(undefined);
  const value = useRxStoreValue(store);
  useRxSubscription(sourceFabric, deps, () => store, [store]);

  return value;
}
