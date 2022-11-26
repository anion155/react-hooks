import { jest, expect, test, describe } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { BehaviorSubject } from "rxjs";

import { createReactRxStore } from "../react-rx-store";
import { useRxStore, useRxStoreValue } from "../use-rx-store";

import { mockObservable } from "./mock-observable";

describe("useRxStore", () => {
  const value = Symbol("test-value") as symbol;
  const subject = new BehaviorSubject(value);
  const complete = jest.spyOn(subject, "complete");

  test("render", () => {
    const hook = renderHook(() => useRxStore(value));
    expect(hook.result.current.getValue()).toBe(value);
  });

  test("unmount", () => {
    const hook = renderHook(() => useRxStore(subject));
    hook.unmount();

    expect(complete).toHaveBeenCalledWith();
  });

  test("re-render", () => {
    const nextSubject = new BehaviorSubject(value);
    const hook = renderHook(({ sub }) => useRxStore(sub), {
      initialProps: { sub: subject },
    });
    hook.rerender({ sub: nextSubject });

    expect(Object.getPrototypeOf(hook.result.current)).toBe(subject);
  });
});

describe("useRxStoreValue", () => {
  const value = Symbol("test-value") as symbol;
  const store = createReactRxStore(value);
  const { subscribe, unsubscribe } = mockObservable(store);

  test("render", () => {
    const hook = renderHook(() => useRxStoreValue(store));

    expect(subscribe).toHaveBeenCalledWith(expect.any(Function));
    expect(hook.result.current).toBe(value);
  });

  test("unmount", () => {
    const hook = renderHook(() => useRxStore(store));
    hook.unmount();

    expect(unsubscribe).toHaveBeenCalledWith();
  });

  test("re-render, with new store", () => {
    const nextValue = Symbol("test-next-value") as symbol;
    const nextStore = createReactRxStore(nextValue);
    const next = mockObservable(nextStore);
    const hook = renderHook(({ sub }) => useRxStoreValue(sub), {
      initialProps: { sub: store },
    });
    hook.rerender({ sub: nextStore });

    expect(next.subscribe).toHaveBeenCalledWith(expect.any(Function));
    expect(unsubscribe).toHaveBeenCalledWith();
    expect(hook.result.current).toBe(nextValue);
  });
});
