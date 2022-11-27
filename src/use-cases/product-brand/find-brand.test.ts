import { makeFindBrandById } from "./find-brand";

const database = Object.freeze({
  findById: jest.fn(),
});

const findBrandById = makeFindBrandById({ database });

beforeEach(() => {
  Object.values(database).forEach((method) => method.mockReset());
});

it(`calls the database.findById with the given id and returns the response`, async () => {
  const response = Object.freeze({ name: "A" });
  database.findById.mockResolvedValueOnce(response);

  const id = "2342312";
  const result = await findBrandById({ id });

  expect(result).toBe(response);
  expect(database.findById).toHaveBeenCalledTimes(1);
  expect(database.findById).toHaveBeenCalledWith({ id });
});
