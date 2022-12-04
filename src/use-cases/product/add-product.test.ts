import { makeAddProduct } from "./add-product";
import { sampleMakeProductArgument } from "../../../fixtures/product";

const database = Object.freeze({
  insert: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const addProduct = makeAddProduct({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  dbMethods.forEach((method) => method.mockReset());
});

describe("Validation", () => {
  it(`throws error if product info is invalid`, async () => {
    expect.assertions(1 + dbMethods.length);

    try {
      // @ts-expect-error
      await addProduct({ product: { name: "A" } });
    } catch (ex) {
      expect(ex).toEqual(expect.any(Object));
    }

    for (const method of dbMethods) expect(method).not.toHaveBeenCalled();
  });
});

describe("Functionality", () => {
  it(`creates and inserts a product into the db`, async () => {
    const product = await addProduct({ product: sampleMakeProductArgument });
    expect(product).toMatchObject({ ...sampleMakeProductArgument });

    expect(database.insert).toHaveBeenCalledTimes(1);
    expect(database.insert).toHaveBeenCalledWith(product);
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    const transaction: any = "wicked db transaction" + Math.random();
    await addProduct({ product: sampleMakeProductArgument }, { transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
