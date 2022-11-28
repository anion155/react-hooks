import { expect, test } from "@jest/globals";

import { assert } from "../utils/assert";

test("assert", () => {
  const message = "DeveloperError: assert message";

  expect(assert(5, message)).toBeUndefined();
  expect(() => assert(undefined, message)).toThrow(message);
  expect(() => assert(null, message)).toThrow(message);
  expect(() => assert(0, message)).toThrow(message);
  expect(() => assert(false, message)).toThrow(message);
});
