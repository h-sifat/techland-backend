import { deepFreeze } from "../../common/util/deep-freeze";
import { makeListProductBrands } from "./list-brands";

const database = Object.freeze({
  findAll: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const listProductBrands = makeListProductBrands({ getDatabase });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns all the results from the database.findAll method`, async () => {
    const mockBrands = deepFreeze([{ a: 1 }, { b: 1 }]);
    database.findAll.mockResolvedValueOnce(mockBrands);

    const productBrands = await listProductBrands();
    expect(productBrands).toEqual(mockBrands);

    expect(database.findAll).toHaveBeenCalledTimes(1);
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    const mockBrands = deepFreeze([{ a: 1 }, { b: 1 }]);
    database.findAll.mockResolvedValueOnce(mockBrands);

    const transaction: any = "wicked db transaction" + Math.random();
    await listProductBrands({ transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
