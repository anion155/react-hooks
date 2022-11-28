import { jest, expect, test, describe } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { Observer } from "rxjs";
import { of, throwError } from "rxjs";

import { useRxSubscription } from "../use-rx-subscription";

import { mockObservable } from "./mock-observable";

describe("useRxSubscription", () => {
  const value = Symbol("test-value") as symbol;

  const source = of(value);
  const { subscribe, unsubscribe } = mockObservable(source);
  const sourceFabric = jest.fn(() => source);

  const observer: Observer<symbol> = {
    next: jest.fn(),
    error: jest.fn(),
    complete: jest.fn(),
  };
  const observerFabric = jest.fn(() => observer);

  test("render", () => {
    const hook = renderHook(() => useRxSubscription(sourceFabric, []));

    expect(sourceFabric).toHaveBeenCalledWith();
    expect(subscribe).toHaveBeenCalledWith(undefined);
    expect(hook.result.current).toBeUndefined();
  });

  test("unmount", () => {
    const hook = renderHook(() => useRxSubscription(sourceFabric, []));
    hook.unmount();

    expect(unsubscribe).toHaveBeenCalledWith();
  });

  test("re-render, with new sourceFabric, same deps", () => {
    const nextSourceFabric = jest.fn(() => of(value));
    const hook = renderHook(({ sourceF }) => useRxSubscription(sourceF, []), {
      initialProps: { sourceF: sourceFabric },
    });
    hook.rerender({ sourceF: nextSourceFabric });

    expect(sourceFabric).toHaveBeenCalledWith();
    expect(nextSourceFabric).not.toHaveBeenCalled();
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  test("re-render, with new sourceFabric, and deps", () => {
    const nextSourceFabric = jest.fn(() => of(value));
    const hook = renderHook(
      ({ sourceF, deps }) => useRxSubscription(sourceF, deps),
      {
        initialProps: { sourceF: sourceFabric, deps: [1] },
      }
    );
    sourceFabric.mockClear();
    hook.rerender({ sourceF: nextSourceFabric, deps: [2] });

    expect(sourceFabric).not.toHaveBeenCalled();
    expect(nextSourceFabric).toHaveBeenCalledWith();
    expect(unsubscribe).toHaveBeenCalledWith();
  });

  test("render, with observerFabric", () => {
    renderHook(() => useRxSubscription(sourceFabric, [], observerFabric, []));

    expect(observerFabric).toHaveBeenCalledWith();
    expect(observer.next).toHaveBeenCalledWith(value);
    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalledWith();
  });

  test("render, with observerFabric, error source", () => {
    const error = Symbol("test-error");
    renderHook(() =>
      useRxSubscription(() => throwError(() => error), [], observerFabric, [])
    );

    expect(observerFabric).toHaveBeenCalledWith();
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.error).toHaveBeenCalledWith(error);
    expect(observer.complete).not.toHaveBeenCalled();
  });

  test("re-render, with new observerFabric, same deps", () => {
    const nextObserverFabric = jest.fn(() => observer);
    const hook = renderHook(
      ({ observerF }) => useRxSubscription(sourceFabric, [], observerF, []),
      {
        initialProps: { observerF: observerFabric },
      }
    );
    hook.rerender({ observerF: nextObserverFabric });

    expect(observerFabric).toHaveBeenCalledWith();
    expect(nextObserverFabric).not.toHaveBeenCalled();
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  test("re-render, with new observerFabric, and deps", () => {
    const nextObserverFabric = jest.fn(() => observer);
    const hook = renderHook(
      ({ observerF, deps }) =>
        useRxSubscription(sourceFabric, [], observerF, deps),
      {
        initialProps: { observerF: observerFabric, deps: [1] },
      }
    );
    observerFabric.mockClear();
    hook.rerender({ observerF: nextObserverFabric, deps: [2] });

    expect(observerFabric).not.toHaveBeenCalled();
    expect(nextObserverFabric).toHaveBeenCalledWith();
    expect(unsubscribe).toHaveBeenCalledWith();
  });
});
