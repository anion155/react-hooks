import { useRenderEffect } from "@anion155/react-hooks";
import type { DependencyList } from "react";
import { useMemo } from "react";
import type { ObservableInput, PartialObserver } from "rxjs";
import { from } from "rxjs";

export function useRxSubscription<T>(
  sourceFabric: () => ObservableInput<T>,
  sourceDeps: DependencyList
): void;
export function useRxSubscription<T>(
  sourceFabric: () => ObservableInput<T>,
  sourceDeps: DependencyList,
  observerFabric: () => PartialObserver<T>,
  observerDeps: DependencyList
): void;
export function useRxSubscription<T>(
  sourceFabric: () => ObservableInput<T>,
  sourceDeps: DependencyList,
  observerFabric?: () => PartialObserver<T>,
  observerDeps?: DependencyList
): void {
  /* eslint-disable react-hooks/exhaustive-deps -- argument memoization */
  const memoizedSourceFabric = useMemo(() => sourceFabric, sourceDeps);
  const memoizedObserverFabric = useMemo(() => observerFabric, observerDeps);
  /* eslint-enable react-hooks/exhaustive-deps */

  const subscription = useMemo(() => {
    return from(memoizedSourceFabric()).subscribe(memoizedObserverFabric?.());
  }, [memoizedObserverFabric, memoizedSourceFabric]);
  useRenderEffect(() => () => subscription.unsubscribe(), [subscription]);
}
