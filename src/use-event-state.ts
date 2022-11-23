import type { DependencyList } from "react";
import { useCallback, useMemo, useState } from "react";

export type StateInitial<T> = T | { (): T };

const defaultProject = (event: unknown) => event;

export function useEventState<T>(
  stateInitial: StateInitial<T>
): [T, (arg: T) => void];
export function useEventState<As extends unknown[], T>(
  stateInitial: StateInitial<T>,
  project: (...args: As) => T,
  deps: DependencyList
): [T, (...args: As) => void];
export function useEventState<As extends unknown[], T>(
  stateInitial: StateInitial<T>,
  project: (...args: As) => T = defaultProject as never,
  deps: DependencyList = []
): [T, (...args: As) => void] {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- argument memoization
  const memoizedProject = useMemo(() => project, deps);

  const [state, setState] = useState(stateInitial);
  const eventDispatcher = useCallback(
    (...args: As) => {
      const value = memoizedProject(...args);
      setState(value);
    },
    [memoizedProject]
  );

  return [state, eventDispatcher];
}
