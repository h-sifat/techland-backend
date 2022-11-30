import deepFreezeStrict from "deep-freeze-strict";
import { makeFindAll } from "./make-find-all";

const toArray = jest.fn();
const find = jest.fn(() => ({ toArray }));
const collection = Object.freeze({ find });

const findAll = makeFindAll({
  deepFreeze: deepFreezeStrict,
  getCollection: () => <any>collection,
});

beforeEach(() => {
  find.mockClear();
  toArray.mockClear();
});

describe("Functionality", () => {
  it(`calls the collection.find method and returns the result`, async () => {
    const fakeResponse = [{ _id: 1 }];
    toArray.mockResolvedValueOnce(fakeResponse);

    const result = await findAll();
    expect(result).toEqual(fakeResponse);
    expect(Object.isFrozen(result)).toBeTruthy();

    expect(collection.find).toHaveBeenCalledTimes(1);
  });
});
