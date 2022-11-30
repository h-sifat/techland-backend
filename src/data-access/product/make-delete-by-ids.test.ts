import { makeDeleteByIds } from "./make-delete-by-ids";

const collection = Object.freeze({
  deleteMany: jest.fn(),
});

const deleteByIds = makeDeleteByIds({ getCollection: () => collection });

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`calls the collection.deleteMany with the given ids`, async () => {
    const ids = Object.freeze(["a", "b"]) as string[];
    await deleteByIds({ ids });

    expect(collection.deleteMany).toHaveBeenCalledTimes(1);
    expect(collection.deleteMany).toHaveBeenCalledWith({ _id: { $in: ids } });
  });
});
