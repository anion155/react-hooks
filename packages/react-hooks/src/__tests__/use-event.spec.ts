import { jest, expect, test, describe } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

import { useEventState } from "../use-event-state";

describe("useEventState", () => {
  const initial = Symbol("test-initial-value") as symbol;
  const next = Symbol("test-next-value") as symbol;
  const project = jest.fn((value) => ({ value }));

  test("render, with initial value", () => {
    const hook = renderHook(() => useEventState(initial));
    expect(hook.result.current[0]).toBe(initial);
  });

  test("render, with initial value fabric", () => {
    const hook = renderHook(() => useEventState(() => initial));
    expect(hook.result.current[0]).toBe(initial);
  });

  test("render, with new initial value", () => {
    const hook = renderHook(({ value }) => useEventState(value), {
      initialProps: { value: 1 },
    });
    hook.rerender({ value: 2 });

    expect(hook.result.current[0]).toBe(1);
  });

  test("eventDispatcher", () => {
    const hook = renderHook(() => useEventState(initial));
    act(() => hook.result.current[1](next));

    expect(hook.result.current[0]).toStrictEqual(next);
  });

  test("eventDispatcher, with project", () => {
    const hook = renderHook(() =>
      useEventState({ value: initial }, project, [])
    );
    act(() => hook.result.current[1](next));

    expect(project).toHaveBeenCalledWith(next);
    expect(hook.result.current[0]).toStrictEqual({ value: next });
  });

  test("project do not update without deps change", () => {
    const nextProject = jest.fn((value) => ({ value }));
    const hook = renderHook(
      ({ proj }) => useEventState({ value: initial }, proj, []),
      { initialProps: { proj: project } }
    );
    hook.rerender({ proj: nextProject });
    act(() => hook.result.current[1](next));

    expect(project).toHaveBeenCalledWith(next);
    expect(nextProject).not.toHaveBeenCalled();
  });

  test("project update with deps change", () => {
    const nextProject = jest.fn((value) => ({ value }));
    const hook = renderHook(
      ({ proj, deps }) => useEventState({ value: initial }, proj, deps),
      { initialProps: { proj: project, deps: [0] } }
    );
    hook.rerender({ proj: nextProject, deps: [1] });
    act(() => hook.result.current[1](next));

    expect(project).not.toHaveBeenCalled();
    expect(nextProject).toHaveBeenCalledWith(next);
  });
});
