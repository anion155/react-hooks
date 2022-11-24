import type { DependencyList } from "react";
import { useMemo } from "react";
import type { ObservableInput, PartialObserver } from "rxjs";
import { from } from "rxjs";

import { useRenderEffect } from "../index";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- argument memoization
  const memoizedSourceFabric = useMemo(() => sourceFabric, sourceDeps);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- argument memoization
  const memoizedObserverFabric = useMemo(() => observerFabric, observerDeps);

  const subscription = useMemo(() => {
    return from(memoizedSourceFabric()).subscribe(memoizedObserverFabric?.());
  }, [memoizedObserverFabric, memoizedSourceFabric]);
  useRenderEffect(() => () => subscription.unsubscribe(), [subscription]);
}
