import { expect, test } from "@jest/globals";

import { hasOwnProperty } from "../has-own-property";

test("hasOwnProperty", () => {
  expect(hasOwnProperty({}, "hasOwnProperty")).toBe(false);
  expect(hasOwnProperty({ a: 5 }, "a")).toBe(true);
});
