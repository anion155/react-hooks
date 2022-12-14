import { useConst, useRenderEffect } from "@anion155/react-hooks";
import type { DependencyList } from "react";
import { useCallback, useMemo } from "react";
import type { ObservableInput } from "rxjs";
import { Subscription, from } from "rxjs";

import type { PromiseSubscribed, PromiseSubscriber } from "./utils";
import { toPromise } from "./utils";

export function useRxCallback<As extends unknown[], T>(
  sourceFabric: (...args: As) => ObservableInput<T>,
  deps: DependencyList
): (...args: As) => PromiseSubscribed<T | undefined>;
export function useRxCallback<As extends unknown[], T, U>(
  sourceFabric: (...args: As) => ObservableInput<T>,
  deps: DependencyList,
  subscriber: PromiseSubscriber<T, U>
): (...args: As) => PromiseSubscribed<U>;
export function useRxCallback<As extends unknown[], T, U>(
  sourceFabric: (...args: As) => ObservableInput<T>,
  deps: DependencyList,
  subscriber?: PromiseSubscriber<T, U>
): (...args: As) => PromiseSubscribed<U> {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- argument memoization
  const memoizedSourceFabric = useMemo(() => sourceFabric, deps);
  const memoizedSubscriber = useConst(
    () => subscriber ?? (useRxCallback.defaultSubscriber() as never)
  );

  const subscription = useConst(() => new Subscription());
  useRenderEffect(() => () => subscription.unsubscribe(), [subscription]);

  const callback = useCallback(
    (...args: As) => {
      const source = from(memoizedSourceFabric(...args));
      const promise = toPromise(source, memoizedSubscriber);
      subscription.add(promise.subscription);
      return promise;
    },
    [memoizedSourceFabric, memoizedSubscriber, subscription]
  );

  return callback;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- intentional
export namespace useRxCallback {
  export const { first, last, withInitial, throttle } = toPromise;

  export function defaultSubscriber<T>() {
    return toPromise.throttle(toPromise.defaultSubscriber<T>());
  }
}
