import { deepFreeze } from "./deep-freeze";

it.each([null, undefined, false, 1, Symbol(), 1n])(
  `doesn't throw error if value is not an object (%p)`,
  (value) => {
    expect(() => {
      deepFreeze(value);
    }).not.toThrow();
  }
);

it(`deep freezes an object`, () => {
  const object = {
    a: { b: [{ c: 3 }, () => {}, Object.freeze({ a: { b: 2 } })] },
  };

  const frozen = deepFreeze(object);

  expect(Object.isFrozen(frozen)).toBeTruthy();
  expect(Object.isFrozen(frozen.a.b)).toBeTruthy();
  expect(Object.isFrozen(frozen.a.b[0])).toBeTruthy();
  expect(Object.isFrozen(frozen.a.b[1])).toBeTruthy();
});
