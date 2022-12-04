import { makeFindProductByIds } from "./find-product-by-ids";

const database = Object.freeze({
  findByIds: jest.fn(),
});

const getDatabase = jest.fn(() => database);
const findProductById = makeFindProductByIds({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
  Object.values(database).forEach((method) => method.mockReset());
});

it(`calls the database.findByIds with the given id and returns the response`, async () => {
  const response = Object.freeze({ name: "A" });
  database.findByIds.mockResolvedValueOnce(response);

  const ids = Object.freeze(["2342312"]) as string[];
  const formatDocumentAs = "private";
  const product = await findProductById({ ids, formatDocumentAs });

  expect(product).toBe(response);
  expect(database.findByIds).toHaveBeenCalledTimes(1);
  expect(database.findByIds).toHaveBeenCalledWith({ ids, formatDocumentAs });
});

it(`passes the transaction to the getDatabase function`, async () => {
  const response = Object.freeze({ name: "A" });
  database.findByIds.mockResolvedValueOnce(response);

  const ids = Object.freeze(["2342312"]) as string[];
  const formatDocumentAs = "private";
  const transaction: any = "wicked db transaction" + Math.random();
  await findProductById({ ids, formatDocumentAs }, { transaction });

  expect(getDatabase).toHaveBeenCalledWith({ transaction });
});
