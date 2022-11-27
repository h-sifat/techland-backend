import deepFreezeStrict from "deep-freeze-strict";
import { makeListProducts } from "./list-products";

const database = Object.freeze({
  find: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const listProducts = makeListProducts({ database });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`passes the arguments to the database.find method and returns the response`, async () => {
    const arg = deepFreezeStrict({
      pagination: { pageNumber: 1, itemsPerPage: 20 },
    } as const);
    const options = Object.freeze({ audience: "public" } as const);

    const fakeResponse = `The computer said: "You're a loser".`;
    database.find.mockResolvedValueOnce(fakeResponse);

    const result = await listProducts(arg, options);
    expect(result).toBe(fakeResponse);

    expect(database.find).toHaveBeenCalledTimes(1);
    expect(database.find).toHaveBeenCalledWith(arg, options);
  });
});
