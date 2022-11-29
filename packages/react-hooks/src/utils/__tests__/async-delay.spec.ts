import { describe, expect, jest, test } from "@jest/globals";

import { asyncDelay } from "../async-delay";
import { CanceledError } from "../cancelable-promise";

jest.useFakeTimers();
const setTimeout = jest.spyOn(global, "setTimeout");
const clearTimeout = jest.spyOn(global, "clearTimeout");

describe("asyncDelay", () => {
  test("resolved", async () => {
    const promise = asyncDelay(100);

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100);

    jest.runAllTimers();

    await expect(promise).resolves.toBeUndefined();
  });

  test("canceled", async () => {
    const promise = asyncDelay(100);
    promise.cancel();

    jest.runAllTimers();

    await expect(promise).rejects.toBeInstanceOf(CanceledError);
    expect(clearTimeout).toHaveBeenCalledWith(setTimeout.mock.results[0].value);
  });
});
