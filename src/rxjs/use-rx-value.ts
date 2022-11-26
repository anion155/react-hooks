import type { DependencyList } from "react";
import type { BehaviorSubject, ObservableInput } from "rxjs";

import { useRxState } from "./use-rx-state";
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
  const [value, , store] = useRxState<T | undefined>(undefined);
  useRxSubscription(sourceFabric, deps, () => store, [store]);

  return value;
}
