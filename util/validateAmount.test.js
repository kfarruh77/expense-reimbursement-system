const { validateAmount } = require("./authUtil");

test("returns true when amount provided is a number type", () => {
  expect(validateAmount(75)).toBe(true);
});

test("returns false when amount provided is a NaN type", () => {
  expect(validateAmount(Number("str"))).toBe(false);
});
