import { jest, expect, test, describe } from "@jest/globals";
import { renderHook } from "@testing-library/react";

import { useConst } from "../use-const";

describe("useConst", () => {
  const result = Symbol("test-result");
  const fabric = jest.fn().mockReturnValue(result);

  test("first render", () => {
    const hook = renderHook(() => useConst(fabric));

    expect(hook.result.current).toBe(result);
    expect(fabric).toHaveBeenCalledWith();
  });

  test("second render", () => {
    const hook = renderHook(() => useConst(fabric));
    hook.rerender();

    expect(hook.result.current).toBe(result);
    expect(fabric).toHaveBeenCalledTimes(1);
  });

  test("second render, with new fabric", () => {
    const hook = renderHook((props) => useConst(props.fabric), {
      initialProps: { fabric },
    });
    const newFabric = jest.fn().mockReturnValue(result);
    hook.rerender({ fabric: newFabric });

    expect(hook.result.current).toBe(result);
    expect(fabric).toHaveBeenCalledTimes(1);
    expect(newFabric).not.toHaveBeenCalled();
  });
});
