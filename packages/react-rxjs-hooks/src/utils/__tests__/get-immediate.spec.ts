import { describe, expect, test } from "@jest/globals";
import { BehaviorSubject, delay, of, throwError } from "rxjs";

import { EmptyValueError } from "../errors";
import { getImmediate } from "../get-immediate";

describe("getImmediate", () => {
  const value = Symbol("test-value") as symbol;
  const error = Symbol("test-error") as symbol;

  test("with completed with value", () => {
    const source = of(value);
    expect(getImmediate(source)).toStrictEqual({ value });
  });

  test("with delayed", () => {
    const source = of(value).pipe(delay(1));
    expect(getImmediate(source)).toBeUndefined();
  });

  test("with errored", () => {
    const source = throwError(() => error);
    expect(getImmediate(source)).toStrictEqual({ error });
  });

  test("with completed without value", () => {
    const source = new BehaviorSubject(value);
    source.complete();
    expect(getImmediate(source)).toStrictEqual({
      error: expect.any(EmptyValueError),
    });
  });
});
