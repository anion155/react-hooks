import { describe, expect, jest, test } from "@jest/globals";

import { cancelablePromise, CanceledError } from "../cancelable-promise";

describe("cancelablePromise", () => {
  test("resolved", async () => {
    await expect(cancelablePromise((resolve) => resolve(5))).resolves.toBe(5);
  });

  test("rejected", async () => {
    await expect(cancelablePromise((_, reject) => reject(5))).rejects.toBe(5);
  });

  test("canceled", async () => {
    const promise = cancelablePromise(() => {});
    promise.cancel();

    await expect(promise).rejects.toBeInstanceOf(CanceledError);
  });

  test("canceled state", () => {
    try {
      jest.useFakeTimers();

      const callWithState = jest.fn();
      const promise = cancelablePromise((res, rej, state) => {
        callWithState(state.canceled);
        setTimeout(() => {
          callWithState(state.canceled);
        }, 100);
      });
      promise.cancel();
      promise.catch(() => {});

      jest.runAllTimers();

      expect(callWithState).toHaveBeenCalledTimes(2);
      expect(callWithState).toHaveBeenNthCalledWith(1, false);
      expect(callWithState).toHaveBeenNthCalledWith(2, true);
    } finally {
      jest.useRealTimers();
    }
  });

  test("canceled with cleanup", () => {
    const cleanup = jest.fn();
    const promise = cancelablePromise(() => cleanup);

    expect(cleanup).not.toHaveBeenCalled();
    promise.cancel();
    promise.catch(() => {});
    expect(cleanup).toHaveBeenCalledWith();
  });
});
