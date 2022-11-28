import { describe, expect, jest, test } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import {
  delay,
  first as firstRx,
  of,
  Subject,
  Subscription,
  throwError,
} from "rxjs";

import type { PromiseSubscriber } from "../to-promise";
import { toPromise } from "../to-promise";
import { useRxCallback } from "../use-rx-callback";

describe("useRxCallback", () => {
  const value = Symbol("test-value") as symbol;
  const next = Symbol("test-next") as symbol;
  const error = Symbol("test-error") as symbol;

  test("render", () => {
    const hook = renderHook(() => useRxCallback(() => of(value), []));
    expect(hook.result.current).toStrictEqual(expect.any(Function));
  });

  test("unmount", () => {
    const unsubscribe = jest.spyOn(Subscription.prototype, "unsubscribe");
    const hook = renderHook(() => useRxCallback(() => of(value), []));
    unsubscribe.mockClear();
    hook.unmount();

    expect(unsubscribe).toHaveBeenCalledWith();
  });

  test("re-render with next source, same deps", () => {
    const source = () => of(value);
    const nextSource = () => of(next);
    const hook = renderHook(({ cb }) => useRxCallback(cb, []), {
      initialProps: { cb: source },
    });
    const first = hook.result.current;
    hook.rerender({ cb: nextSource });

    expect(hook.result.current).toBe(first);
  });

  test("re-render with next source, next deps", () => {
    const source = () => of(value);
    const nextSource = () => of(next);
    const hook = renderHook(({ cb, deps }) => useRxCallback(cb, deps), {
      initialProps: { cb: source, deps: [1] },
    });
    const first = hook.result.current;
    hook.rerender({ cb: nextSource, deps: [2] });

    expect(hook.result.current).not.toBe(first);
  });

  test("re-render with next subscriber", () => {
    const hook = renderHook(
      ({ sub }) => useRxCallback(() => of(value), [], sub),
      {
        initialProps: { sub: useRxCallback.first<unknown>() },
      }
    );
    const first = hook.result.current;
    hook.rerender({ sub: useRxCallback.last() });

    expect(hook.result.current).toBe(first);
  });

  test("callback", async () => {
    const subscriber = jest.fn<PromiseSubscriber<symbol>>(
      (source, resolve, reject) => {
        return source
          .pipe(firstRx())
          .subscribe({ next: resolve, error: reject });
      }
    );
    const source = of(value).pipe(delay(100));
    const cb = jest.fn((..._args: any[]) => source);

    const hook = renderHook(() => useRxCallback(cb, [], subscriber));
    const promise = hook.result.current(1, 2);

    expect(cb).toHaveBeenCalledWith(1, 2);
    expect(subscriber).toHaveBeenCalledWith(
      source,
      expect.any(Function),
      expect.any(Function)
    );
    expect(promise.subscription).toBe(subscriber.mock.results[0].value);
    await expect(promise).resolves.toBe(value);
  });

  describe("subscribers", () => {
    const result =
      jest.fn<(result: { value: unknown } | { error: unknown }) => void>();
    const resolve = jest.fn((resolved: unknown) => {
      if (!result.mock.lastCall) result({ value: resolved });
    });
    const reject = jest.fn((rejected: unknown) => {
      if (!result.mock.lastCall) result({ error: rejected });
    });

    const completed = new Subject();
    completed.complete();

    test("hoisted", () => {
      const pick = (ns: typeof useRxCallback | typeof toPromise) => {
        const { first, last, throttle, withInitial } = ns;
        return { first, last, throttle, withInitial };
      };
      expect(pick(useRxCallback)).toStrictEqual(pick(toPromise));
    });

    describe(".defaultSubscriber", () => {
      test("with value", () => {
        const subscriber = useRxCallback.defaultSubscriber();
        const subscription = subscriber(of(value), resolve, reject);

        expect(subscription).toBeInstanceOf(Subscription);
        expect(result).toHaveBeenCalledWith({ value });
      });

      test("with error", () => {
        const subscriber = useRxCallback.defaultSubscriber();
        subscriber(
          throwError(() => error),
          resolve,
          reject
        );
        expect(result).toHaveBeenCalledWith({ error });
      });

      test("without value", () => {
        const subscriber = useRxCallback.defaultSubscriber();
        subscriber(completed, resolve, reject);
        expect(result).toHaveBeenCalledWith({ value: undefined });
      });

      test("second time", () => {
        const subscriber = useRxCallback.defaultSubscriber();
        const subscription = subscriber(new Subject(), resolve, reject);
        const unsubscribe = jest.spyOn(subscription, "unsubscribe");
        subscriber(new Subject(), resolve, reject);

        expect(unsubscribe).toHaveBeenCalledWith();
      });
    });
  });
});
