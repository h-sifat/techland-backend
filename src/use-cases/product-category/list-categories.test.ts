import { makeListProductCategories } from "./list-categories";
import { deepFreeze } from "../../common/util/deep-freeze";

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
    const mockCategories = deepFreeze([{ a: 1 }, { b: 1 }]);
    database.findAll.mockResolvedValueOnce(mockCategories);

    const arg = Object.freeze({ formatDocumentAs: "private" });

    const productCategories = await listProductCategories(arg);
    expect(productCategories).toEqual(mockCategories);

    expect(database.findAll).toHaveBeenCalledTimes(1);
    expect(database.findAll).toHaveBeenCalledWith(arg);
  });
});
