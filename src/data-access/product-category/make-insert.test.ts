import { makeInsert } from "./make-insert";

const collection = Object.freeze({
  insertOne: jest.fn(),
});

const insert = makeInsert({ getCollection: () => <any>collection });

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`inserts a document`, async () => {
    const doc = Object.freeze({ name: "a" });

    // @ts-expect-error
    await insert(doc);

    expect(collection.insertOne).toHaveBeenCalledTimes(1);
    expect(collection.insertOne).toHaveBeenCalledWith(doc);
  });
});
