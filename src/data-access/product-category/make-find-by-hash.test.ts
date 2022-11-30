import deepFreezeStrict from "deep-freeze-strict";
import { makeFindByHash } from "./make-find-by-hash";

const collection = Object.freeze({
  findOne: jest.fn(),
});

const findByHash = makeFindByHash({
  deepFreeze: deepFreezeStrict,
  getCollection: () => <any>collection,
});

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`calls the collection.findOne with the given hash`, async () => {
    const hash = "a";
    const fakeResponse = { name: "MSI" };

    collection.findOne.mockResolvedValueOnce(fakeResponse);

    const result = await findByHash({ hash });
    expect(result).toEqual(fakeResponse);
    expect(Object.isFrozen(result)).toBeTruthy();

    expect(collection.findOne).toHaveBeenCalledTimes(1);
    expect(collection.findOne).toHaveBeenCalledWith({ hash });
  });
});
