import { deepFreeze } from "../../common/util/deep-freeze";
import { makeFindSubCategories } from "./find-sub-categories";

const database = Object.freeze({
  findSubCategories: jest.fn(),
});

const getDatabase = jest.fn(() => database);
const findSubCategories = makeFindSubCategories({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  Object.values(database).forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`call the db.findSubCategories method with the given id and returns the response`, async () => {
    const fakeResponse = deepFreeze({
      category: { name: "A" },
      subCategories: [{ name: "B" }],
    });
    database.findSubCategories.mockResolvedValueOnce(fakeResponse);

    const arg = Object.freeze({
      id: "abc",
      formatDocumentAs: "public",
    } as const);
    const response = await findSubCategories(arg);
    expect(response).toEqual(fakeResponse);

    expect(database.findSubCategories).toHaveBeenCalledTimes(1);
    expect(database.findSubCategories).toHaveBeenCalledWith(arg);
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    const transaction: any = "wicked db transaction" + Math.random();

    const fakeResponse = deepFreeze({
      category: { name: "A" },
      subCategories: [{ name: "B" }],
    });
    database.findSubCategories.mockResolvedValueOnce(fakeResponse);

    const arg = Object.freeze({
      id: "abc",
      formatDocumentAs: "public",
    } as const);
    await findSubCategories(arg, { transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
