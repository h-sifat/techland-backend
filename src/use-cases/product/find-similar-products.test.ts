import { deepFreeze } from "../../common/util/deep-freeze";
import { makeFindSimilarProducts } from "./find-similar-products";

const database = Object.freeze({
  findByIds: jest.fn(),
  findSimilarProducts: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const findSimilarProducts = makeFindSimilarProducts({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  const arg = Object.freeze({
    id: "1",
    count: 5,
  });

  it(`returns an empty array if the product with the given id is not found`, async () => {
    // means: the product is not found
    database.findByIds.mockResolvedValueOnce([]);

    const similarProducts = await findSimilarProducts(arg);
    expect(similarProducts).toEqual([]);

    expect(database.findByIds).toHaveBeenCalledTimes(1);
    expect(database.findByIds).toHaveBeenCalledWith({
      ids: [arg.id],
      formatDocumentAs: "private",
    });

    expect(database.findSimilarProducts).not.toHaveBeenCalled();
  });

  it(`returns similar products`, async () => {
    const fakeProduct = Object.freeze({
      _id: arg.id,
      name: "Antech Power-Supply",
    });
    database.findByIds.mockResolvedValueOnce([fakeProduct]);

    const fakeSimilarProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    database.findSimilarProducts.mockResolvedValueOnce(fakeSimilarProducts);

    const similarProducts = await findSimilarProducts(arg);
    expect(similarProducts).toEqual(fakeSimilarProducts);

    expect(database.findByIds).toHaveBeenCalledTimes(1);
    expect(database.findByIds).toHaveBeenCalledWith({
      ids: [arg.id],
      formatDocumentAs: "private",
    });

    expect(database.findSimilarProducts).toHaveBeenCalledTimes(1);
    expect(database.findSimilarProducts).toHaveBeenCalledWith({
      count: arg.count,
      product: fakeProduct,
    });
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    const transaction: any = "wicked db transaction" + Math.random();

    const fakeProduct = Object.freeze({
      _id: arg.id,
      name: "Antech Power-Supply",
    });
    database.findByIds.mockResolvedValueOnce([fakeProduct]);

    const fakeSimilarProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    database.findSimilarProducts.mockResolvedValueOnce(fakeSimilarProducts);

    await findSimilarProducts(arg, { transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
