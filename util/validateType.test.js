const { validateType } = require("./authUtil");

test("returns true when type provided is food", () => {
  expect(validateType("food")).toBe(true);
});

test("returns true when type provided is lodging", () => {
  expect(validateType("lodging")).toBe(true);
});

test("returns true when type provided is travel", () => {
  expect(validateType("travel")).toBe(true);
});

test("returns true when type provided is others", () => {
  expect(validateType("others")).toBe(true);
});

test("returns false when type provided is an invalid value", () => {
  expect(validateType("else")).toBe(false);
});
