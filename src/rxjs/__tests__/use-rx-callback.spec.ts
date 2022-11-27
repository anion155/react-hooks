import { describe, expect, jest, test } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { delay, first, of, Subscription } from "rxjs";

import type { PromiseSubscriber } from "../to-promise";
import { useRxCallback } from "../use-rx-callback";

describe("useRxCallback", () => {
  const value = Symbol("test-value") as symbol;
  const next = Symbol("test-next") as symbol;
  const subscriber = jest.fn<PromiseSubscriber<symbol>>(
    (source, resolve, reject) => {
      return source.pipe(first()).subscribe({ next: resolve, error: reject });
    }
  );

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
    const firstResult = hook.result.current;
    hook.rerender({ cb: nextSource });

    expect(hook.result.current).toBe(firstResult);
  });

  test("re-render with next source, next deps", () => {
    const source = () => of(value);
    const nextSource = () => of(next);
    const hook = renderHook(({ cb, deps }) => useRxCallback(cb, deps), {
      initialProps: { cb: source, deps: [1] },
    });
    const firstResult = hook.result.current;
    hook.rerender({ cb: nextSource, deps: [2] });

    expect(hook.result.current).not.toBe(firstResult);
  });

  test("re-render with next subscriber", () => {
    const hook = renderHook(
      ({ sub }) => useRxCallback(() => of(value), [], sub),
      {
        initialProps: { sub: useRxCallback.first<unknown>() },
      }
    );
    const firstResult = hook.result.current;
    hook.rerender({ sub: useRxCallback.last() });

    expect(hook.result.current).toBe(firstResult);
  });

  test("callback", async () => {
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
});
