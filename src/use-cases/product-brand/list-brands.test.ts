import { deepFreeze } from "../../common/util/deep-freeze";
import { makeListProductBrands } from "./list-brands";

const database = Object.freeze({
  findAll: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const listProductBrands = makeListProductBrands({ database });

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
});
