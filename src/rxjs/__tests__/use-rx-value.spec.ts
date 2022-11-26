import { describe, expect, test } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { delay, of } from "rxjs";

import { useRxValue } from "../use-rx-value";

import { mockObservable } from "./mock-observable";

describe("useRxValue", () => {
  const value = Symbol("test-value") as symbol;
  const source = of(value);
  const { subscribe, unsubscribe } = mockObservable(source);

  test("render", () => {
    const hook = renderHook(() => useRxValue(() => source, []));

    expect(hook.result.current).toStrictEqual(value);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  test("render with delayed observable", async () => {
    const hook = renderHook(() =>
      useRxValue(() => source.pipe(delay(100)), [])
    );

    expect(hook.result.current).toBeUndefined();

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
    hook.rerender();

    expect(hook.result.current).toStrictEqual(value);
  });

  test("re-render with next deps", async () => {
    const hook = renderHook(({ deps }) => useRxValue(() => source, deps), {
      initialProps: { deps: [1] },
    });
    hook.rerender({ deps: [2] });

    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
