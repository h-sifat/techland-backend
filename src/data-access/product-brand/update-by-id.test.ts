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
    const product = Object.freeze({ name: "XFX GPU" }) as any;

    await updateById({ id, document: product });
    expect(collection.replaceOne).toHaveBeenCalledTimes(1);

    expect(collection.replaceOne).toHaveBeenCalledWith(
      { _id: id },
      product,
      {}
    );
  });

  it(`passes the transaction session to the db method`, async () => {
    const session: any = "my transaction session";

    const id = "abc";
    const product = Object.freeze({ name: "XFX GPU" }) as any;

    await updateById({ id, document: product }, { session });
    expect(collection.replaceOne).toHaveBeenCalledTimes(1);

    expect(collection.replaceOne).toHaveBeenCalledWith({ _id: id }, product, {
      session,
    });
  });
});
