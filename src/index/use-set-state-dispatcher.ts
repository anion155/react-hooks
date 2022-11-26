import type { DependencyList } from "react";
import { useCallback, useMemo } from "react";

export type SetStateDispatcher<T> = (state: T | { (current: T): T }) => void;

export function useSetStateDispatcher<T>(
  get: () => T,
  set: (value: T) => void,
  deps: DependencyList
): SetStateDispatcher<T> {
  /* eslint-disable react-hooks/exhaustive-deps -- argument memoization */
  const memoizedGet = useMemo(() => get, deps);
  const memoizedSet = useMemo(() => set, deps);
  /* eslint-enable react-hooks/exhaustive-deps */

  const dispatcher = useCallback<SetStateDispatcher<T>>(
    (nextOrModifier) => {
      const next =
        nextOrModifier instanceof Function
          ? nextOrModifier(memoizedGet())
          : nextOrModifier;
      memoizedSet(next);
    },
    [memoizedGet, memoizedSet]
  );

  return dispatcher;
}
