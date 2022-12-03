import { makeInsert } from "./insert";

const collection = Object.freeze({
  insertOne: jest.fn(),
});

const insert = makeInsert({ collection: <any>collection });

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`inserts a document`, async () => {
    const doc = Object.freeze({ name: "a" });

    // @ts-expect-error
    await insert(doc);

    expect(collection.insertOne).toHaveBeenCalledTimes(1);
    expect(collection.insertOne).toHaveBeenCalledWith(doc, {});
  });

  it(`passes the transaction session to the db method`, async () => {
    const doc = Object.freeze({ name: "a" });
    const session: any = "my transaction session";

    // @ts-expect-error
    await insert(doc, { session });

    expect(collection.insertOne).toHaveBeenCalledTimes(1);
    expect(collection.insertOne).toHaveBeenCalledWith(doc, { session });
  });
});
