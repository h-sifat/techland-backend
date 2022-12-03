import { makeUpdateById } from "./update-by-id";

const collection = Object.freeze({
  replaceOne: jest.fn(),
});

const updateById = makeUpdateById({ collection: <any>collection });

beforeEach(() => {
  Object.values(collection).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`call the collection.replaceOne with the given _id and document`, async () => {
    const id = "abc";
    const category = Object.freeze({ name: "Processor" }) as any;

    await updateById({ id, category });
    expect(collection.replaceOne).toHaveBeenCalledTimes(1);
    expect(collection.replaceOne).toHaveBeenCalledWith(
      { _id: id },
      category,
      {}
    );
  });

  it(`passes the transaction session to the db method`, async () => {
    const session: any = "my transaction session";

    const id = "abc";
    const document = Object.freeze({ name: "Processor" }) as any;

    await updateById({ id, category: document }, { session });
    expect(collection.replaceOne).toHaveBeenCalledTimes(1);

    expect(collection.replaceOne).toHaveBeenCalledWith({ _id: id }, document, {
      session,
    });
  });
});
