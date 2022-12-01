import deepFreezeStrict from "deep-freeze-strict";
import { makeFindById } from "./find-by-id";

const collection = Object.freeze({
  findOne: jest.fn(),
});

const findById = makeFindById({
  deepFreeze: deepFreezeStrict,
  getCollection: () => <any>collection,
});

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`calls the collection.findOne with the given id`, async () => {
    const id = "a";
    const fakeResponse = { name: "MSI" };

    collection.findOne.mockResolvedValueOnce(fakeResponse);

    const result = await findById({ id });
    expect(result).toEqual(fakeResponse);
    expect(Object.isFrozen(result)).toBeTruthy();

    expect(collection.findOne).toHaveBeenCalledTimes(1);
    expect(collection.findOne).toHaveBeenCalledWith({ _id: id });
  });
});
