import { makeFindProductById } from "./find-product-by-id";

const database = Object.freeze({
  findById: jest.fn(),
});

const findProductById = makeFindProductById({ database });

beforeEach(() => {
  Object.values(database).forEach((method) => method.mockReset());
});

it(`calls the database.findById with the given id and returns the response`, async () => {
  const response = Object.freeze({ name: "A" });
  database.findById.mockResolvedValueOnce(response);

  const id = "2342312";
  const product = await findProductById({ id });

  expect(product).toBe(response);
  expect(database.findById).toHaveBeenCalledTimes(1);
  expect(database.findById).toHaveBeenCalledWith({ id });
});
