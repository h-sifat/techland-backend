import { makeId } from "../../common/util";
import { makeGetSearchSuggestions } from "./get-search-suggestions";

const database = Object.freeze({
  getSearchSuggestions: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const getSearchSuggestions = makeGetSearchSuggestions({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns the response from the database.getSearchSuggestions method`, async () => {
    const fakeResponse = Object.freeze([
      { name: "Keychron K2V2" },
      { name: "Logitech Bla Bla Bla" },
    ]);

    database.getSearchSuggestions.mockResolvedValueOnce(fakeResponse);

    const arg = Object.freeze({
      count: 5,
      brandId: makeId(),
      categoryId: makeId(),
      query: "Cool Keyboard",
    });
    const result = await getSearchSuggestions(arg);
    expect(result).toEqual(fakeResponse);

    expect(database.getSearchSuggestions).toHaveBeenCalledTimes(1);
    expect(database.getSearchSuggestions).toHaveBeenCalledWith(arg);
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    const transaction: any = "wicked db transaction" + Math.random();
    const fakeResponse = Object.freeze([
      { name: "Keychron K2V2" },
      { name: "Logitech Bla Bla Bla" },
    ]);

    database.getSearchSuggestions.mockResolvedValueOnce(fakeResponse);

    const arg = Object.freeze({
      count: 5,
      brandId: makeId(),
      categoryId: makeId(),
      query: "Cool Keyboard",
    });
    await getSearchSuggestions(arg, { transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
