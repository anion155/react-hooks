import type { DependencyList } from "react";
import { useCallback, useMemo } from "react";
import type { BehaviorSubject } from "rxjs";

import { useRxStore } from "./use-rx-store";
import type { ReactRxStoreInput } from "./utils";

const defaultProject = (event: unknown) => event;

export function useRxEventStore<T>(
  storeInitial: ReactRxStoreInput<T>
): [BehaviorSubject<T>, (arg: T) => void];
export function useRxEventStore<As extends unknown[], T>(
  storeInitial: ReactRxStoreInput<T>,
  project: (...args: As) => T,
  deps: DependencyList
): [BehaviorSubject<T>, (...args: As) => void];
export function useRxEventStore<As extends unknown[], T>(
  storeInitial: ReactRxStoreInput<T>,
  project: (...args: As) => T = defaultProject as never,
  deps: DependencyList = []
): [BehaviorSubject<T>, (...args: As) => void] {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- argument memoization
  const memoizedProject = useMemo(() => project, deps);

  const eventsStore = useRxStore<T>(storeInitial);
  const handleEvent = useCallback(
    (...args: As) => {
      const value = memoizedProject(...args);
      eventsStore.next(value);
    },
    [eventsStore, memoizedProject]
  );

  return [eventsStore, handleEvent];
}
