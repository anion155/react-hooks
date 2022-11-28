import { describe, expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

import { createReactRxStore } from "../react-rx-store";
import { useRxEventStore } from "../use-rx-event-store";

describe("useRxEventStore", () => {
  const value = Symbol("test-value") as symbol;
  const store = createReactRxStore(value);
  const projectedStore = createReactRxStore({ v: value });
  const project = jest.fn((v: symbol) => ({ v }));

  test("render", () => {
    const hook = renderHook(() => useRxEventStore(store));
    expect(hook.result.current).toStrictEqual([store, expect.any(Function)]);
  });

  test("re-render with next store", () => {
    const nextStore = createReactRxStore(value);
    const hook = renderHook(({ sub }) => useRxEventStore(sub), {
      initialProps: { sub: store },
    });
    const first = hook.result.current;
    hook.rerender({ sub: nextStore });

    expect(hook.result.current).toStrictEqual(first);
  });

  test("re-render with next project, same deps", () => {
    const nextProject = jest.fn((v: symbol) => ({ v }));
    const hook = renderHook(
      ({ proj }) => useRxEventStore(projectedStore, proj, []),
      {
        initialProps: { proj: project },
      }
    );
    const first = hook.result.current;
    hook.rerender({ proj: nextProject });

    expect(hook.result.current).toStrictEqual(first);
  });

  test("re-render with next project, next deps", () => {
    const nextProject = jest.fn((v: symbol) => ({ v }));
    const hook = renderHook(
      ({ proj, deps }) => useRxEventStore(projectedStore, proj, deps),
      {
        initialProps: { proj: project, deps: [1] },
      }
    );
    const first = hook.result.current;
    hook.rerender({ proj: nextProject, deps: [2] });

    expect(hook.result.current[0]).toBe(first[0]);
    expect(hook.result.current[1]).not.toBe(first[1]);
  });

  test("handleEvent", () => {
    const nextValue = Symbol("test-next-value") as symbol;
    const hook = renderHook(() => useRxEventStore(store));
    act(() => hook.result.current[1](nextValue));

    expect(hook.result.current[0].getValue()).toBe(nextValue);
  });

  test("handleEvent with project", () => {
    const nextValue = Symbol("test-next-value") as symbol;
    const hook = renderHook(() => useRxEventStore(projectedStore, project, []));
    act(() => hook.result.current[1](nextValue));

    expect(hook.result.current[0].getValue()).toStrictEqual({ v: nextValue });
  });
});
