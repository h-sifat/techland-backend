import { makeUpdateById } from "./update-by-id";

const collection = Object.freeze({
  replaceOne: jest.fn(),
});

const updateById = makeUpdateById({ getCollection: () => <any>collection });

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`call the collection.replaceOne with the given _id and document`, async () => {
    const id = "abc";
    const category = Object.freeze({ name: "Processor" }) as any;

    await updateById({ id, category });
    expect(collection.replaceOne).toHaveBeenCalledTimes(1);
    expect(collection.replaceOne).toHaveBeenCalledWith({ _id: id }, category);
  });
});
