import { jest, expect, test, describe } from "@jest/globals";
import { renderHook } from "@testing-library/react";

import { useRenderEffect } from "../use-render-effect";

describe("useRenderEffect", () => {
  const cleanup = jest.fn(() => {});
  const effect = jest.fn(() => cleanup);

  test("render", () => {
    const hook = renderHook(() => useRenderEffect(effect, [1, 2, 3]));

    expect(hook.result.current).toBeUndefined();
    expect(effect).toHaveBeenCalledWith();
    expect(cleanup).not.toHaveBeenCalled();
  });

  test("unmount", () => {
    const hook = renderHook(() => useRenderEffect(effect, [1, 2, 3]));
    hook.unmount();

    expect(cleanup).toHaveBeenCalledWith();
  });

  test("re-render", () => {
    const hook = renderHook(() => useRenderEffect(effect, [1, 2, 3]));
    hook.rerender();

    expect(hook.result.current).toBeUndefined();
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  test("re-render, with changed deps", () => {
    const hook = renderHook((props) => useRenderEffect(effect, props.deps), {
      initialProps: { deps: [1, 2, 3] },
    });
    hook.rerender({ deps: [3, 2, 1] });

    expect(hook.result.current).toBeUndefined();
    expect(effect).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test("re-render, with ref deps", () => {
    const value = { test: 1 };
    const hook = renderHook((props) => useRenderEffect(effect, props.deps), {
      initialProps: { deps: [value] },
    });
    hook.rerender({ deps: [value] });

    expect(hook.result.current).toBeUndefined();
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  test("re-render, with value deps", () => {
    const hook = renderHook((props) => useRenderEffect(effect, props.deps), {
      initialProps: { deps: [{ test: 1 }] },
    });
    hook.rerender({ deps: [{ test: 1 }] });

    expect(hook.result.current).toBeUndefined();
    expect(effect).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test("re-render, with same deps different length", () => {
    const hook = renderHook((props) => useRenderEffect(effect, props.deps), {
      initialProps: { deps: [1, 2, 3] },
    });
    hook.rerender({ deps: [1, 2] });

    expect(hook.result.current).toBeUndefined();
    expect(effect).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
