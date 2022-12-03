import { deepFreeze } from "../../common/util/deep-freeze";
import { makeFindById } from "./find-by-id";

const collection = Object.freeze({
  findOne: jest.fn(),
});

const findById = makeFindById({
  collection: <any>collection,
  deepFreeze: deepFreeze,
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
    expect(collection.findOne).toHaveBeenCalledWith({ _id: id }, {});
  });

  it(`passes the transaction session to the db method`, async () => {
    const id = "a";
    const fakeResponse = { name: "MSI" };
    collection.findOne.mockResolvedValueOnce(fakeResponse);

    const session: any = "my transaction session";
    await findById({ id }, { session });

    expect(collection.findOne).toHaveBeenCalledTimes(1);
    expect(collection.findOne).toHaveBeenCalledWith({ _id: id }, { session });
  });
});
