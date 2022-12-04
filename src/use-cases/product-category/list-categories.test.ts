import { makeListProductCategories } from "./list-categories";
import { deepFreeze } from "../../common/util/deep-freeze";

const database = Object.freeze({
  findAll: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const listProductCategories = makeListProductCategories({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns all the results from the database.findAll method`, async () => {
    const mockCategories = deepFreeze([{ a: 1 }, { b: 1 }]);
    database.findAll.mockResolvedValueOnce(mockCategories);

    const arg = Object.freeze({ formatDocumentAs: "private" });

    const productCategories = await listProductCategories(arg);
    expect(productCategories).toEqual(mockCategories);

    expect(database.findAll).toHaveBeenCalledTimes(1);
    expect(database.findAll).toHaveBeenCalledWith(arg);
  });
});

it(`passes the transaction to the getDatabase function`, async () => {
  const mockCategories = deepFreeze([{ a: 1 }, { b: 1 }]);
  database.findAll.mockResolvedValueOnce(mockCategories);

  const transaction: any = "wicked db transaction" + Math.random();
  const arg = Object.freeze({ formatDocumentAs: "private" });

  await listProductCategories(arg, { transaction });

  expect(getDatabase).toHaveBeenCalledWith({ transaction });
});
