const { validateStatus } = require("./authUtil");

test("returns true when status provided is pending", () => {
  expect(validateStatus("pending")).toBe(true);
});

test("returns true when status provided is denied", () => {
  expect(validateStatus("denied")).toBe(true);
});

test("returns true when status provided is approved", () => {
  expect(validateStatus("approved")).toBe(true);
});

test("returns false when status provided is an invalid value", () => {
  expect(validateStatus("else")).toBe(false);
});
