import deepFreeze from "deep-freeze-strict";
import { makeFindByName } from "./find-by-name";

const collection = Object.freeze({
  findOne: jest.fn(),
});

const findByName = makeFindByName({ collection, deepFreeze });

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`calls the collection.findOne with the given name`, async () => {
    const name = "MSI";
    const fakeResponse = { name: "MSI" };

    collection.findOne.mockResolvedValueOnce(fakeResponse);

    const result = await findByName({ name });
    expect(result).toEqual(fakeResponse);
    expect(Object.isFrozen(result)).toBeTruthy();

    expect(collection.findOne).toHaveBeenCalledTimes(1);
    expect(collection.findOne).toHaveBeenCalledWith({ name }, {});
  });

  it(`passes the transaction session to the db method`, async () => {
    const name = "MSI";
    const fakeResponse = { name: "MSI" };
    collection.findOne.mockResolvedValueOnce(fakeResponse);

    const session: any = "my transaction session";
    await findByName({ name }, { session });

    expect(collection.findOne).toHaveBeenCalledTimes(1);
    expect(collection.findOne).toHaveBeenCalledWith({ name }, { session });
  });
});
