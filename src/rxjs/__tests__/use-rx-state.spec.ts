import { describe, expect, test } from "@jest/globals";
import { renderHook } from "@testing-library/react";

import { createReactRxStore } from "../react-rx-store";
import { useRxState } from "../use-rx-state";

describe("useRxState", () => {
  const value = Symbol("test-value") as symbol;
  const store = createReactRxStore(value);

  test("render", () => {
    const hook = renderHook(() => useRxState(store));

    expect(hook.result.current).toStrictEqual([
      value,
      store.reactDispatch,
      store,
    ]);
  });
});
