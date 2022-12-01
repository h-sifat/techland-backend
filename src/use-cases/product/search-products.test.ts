import { makeId } from "../../common/util";
import { makeSearchProducts } from "./search-products";

const database = Object.freeze({
  searchProducts: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const searchProducts = makeSearchProducts({ database });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns the response from the database.searchProducts method`, async () => {
    const fakeResponse = Object.freeze([
      "O Allah, will I be able to finish before deadline? 😟",
      `The computer said: "You suck!". 😭`,
    ]);
    database.searchProducts.mockResolvedValueOnce(fakeResponse);

    const arg = Object.freeze({
      brandId: makeId(),
      categoryId: makeId(),
      formatDocumentAs: "public",
      query: "Kinesis Advantage 2",
      pagination: { pageNumber: 1, itemsPerPage: 20 },
    });
    const result = await searchProducts(arg);
    expect(result).toEqual(fakeResponse);

    expect(database.searchProducts).toHaveBeenCalledTimes(1);
    expect(database.searchProducts).toHaveBeenCalledWith(arg);
  });
});
