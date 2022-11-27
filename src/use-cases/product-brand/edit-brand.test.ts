import { makeEditProductBrand } from "./edit-brand";
import { ProductBrand } from "../../entities/product-brand";

const database = Object.freeze({
  findById: jest.fn(),
  updateById: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const editProductBrand = makeEditProductBrand({ database });
const sampleBrand = ProductBrand.make({ name: "Samsung" });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Validation", () => {
  {
    const errorCode = "NOT_FOUND";
    it(`throws ewc "${errorCode}" if no product-brand exists with the given id`, async () => {
      expect.assertions(4);

      database.findById.mockResolvedValueOnce(null);
      const id = "a";

      try {
        // @ts-ignore
        await editProductBrand({ id, changes: {} });
      } catch (ex) {
        expect(ex.code).toBe(errorCode);
      }

      expect(database.findById).toHaveBeenCalledTimes(1);
      expect(database.findById).toHaveBeenCalledWith({ id });
      expect(database.updateById).not.toHaveBeenCalled();
    });
  }

  it(`throws error if the "changes" object is invalid`, async () => {
    expect.assertions(4);

    database.findById.mockResolvedValueOnce(sampleBrand);
    const id = sampleBrand._id;

    try {
      await editProductBrand({
        id,
        // @ts-expect-error
        changes: { name: ["Not a string"], unknown: "hi" },
      });
    } catch (ex) {
      expect(1).toBe(1);
    }

    expect(database.findById).toHaveBeenCalledTimes(1);
    expect(database.findById).toHaveBeenCalledWith({ id });
    expect(database.updateById).not.toHaveBeenCalled();
  });
});

describe("Functionality", () => {
  it(`edits a brand`, async () => {
    database.findById.mockResolvedValueOnce(sampleBrand);
    const id = sampleBrand._id;
    const changes = Object.freeze({ name: sampleBrand.name + "x" });

    const edited = await editProductBrand({ id, changes });
    expect(edited).toEqual({
      ...sampleBrand,
      ...changes,
      lastModifiedAt: expect.any(Number),
    });
  });
});
