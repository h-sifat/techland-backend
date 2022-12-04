import { deepFreeze } from "../../common/util/deep-freeze";
import { makeListProducts } from "./list-products";

const database = Object.freeze({
  find: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const listProducts = makeListProducts({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`passes the arguments to the database.find method and returns the response`, async () => {
    const arg = deepFreeze({
      formatDocumentAs: "private",
      pagination: { pageNumber: 1, itemsPerPage: 20 },
    } as const);

    const fakeResponse = `The computer said: "You're a loser".`;
    database.find.mockResolvedValueOnce(fakeResponse);

    const result = await listProducts(arg);
    expect(result).toBe(fakeResponse);

    expect(database.find).toHaveBeenCalledTimes(1);
    expect(database.find).toHaveBeenCalledWith(arg);
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    const transaction: any = "wicked db transaction" + Math.random();
    const arg = deepFreeze({
      formatDocumentAs: "private",
      pagination: { pageNumber: 1, itemsPerPage: 20 },
    } as const);

    const fakeResponse = `The computer said: "You're a loser".`;
    database.find.mockResolvedValueOnce(fakeResponse);

    await listProducts(arg, { transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
