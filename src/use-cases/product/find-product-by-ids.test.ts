import { makeFindProductById } from "./find-product-by-ids";

const database = Object.freeze({
  findByIds: jest.fn(),
});

const findProductById = makeFindProductById({ database });

beforeEach(() => {
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
