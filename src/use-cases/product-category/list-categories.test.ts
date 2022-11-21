import deepFreezeStrict from "deep-freeze-strict";
import { makeListProductCategories } from "./list-categories";

const database = Object.freeze({
  findAll: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const listProductCategories = makeListProductCategories({ database });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns all the results from the database.findAll method`, async () => {
    const mockCategories = deepFreezeStrict([{ a: 1 }, { b: 1 }]);
    database.findAll.mockResolvedValueOnce(mockCategories);

    const productCategories = await listProductCategories();
    expect(productCategories).toEqual(mockCategories);

    expect(database.findAll).toHaveBeenCalledTimes(1);
  });
});
