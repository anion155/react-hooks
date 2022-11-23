import { useCallback } from "react";

import { useConst } from "./use-const";

export type SetStateDispatcher<T> = (state: T | { (current: T): T }) => void;

export function useSetStateDispatcher<T>(
  get: () => T,
  set: (value: T) => void
): SetStateDispatcher<T> {
  const initialGet = useConst(() => get);
  const initialSet = useConst(() => set);

  const dispatcher = useCallback<SetStateDispatcher<T>>(
    (nextOrModifier) => {
      const next =
        nextOrModifier instanceof Function
          ? nextOrModifier(initialGet())
          : nextOrModifier;
      initialSet(next);
    },
    [initialGet, initialSet]
  );

  return dispatcher;
}
