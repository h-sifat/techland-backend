import { sampleProduct } from "../../../fixtures/product";
import { makeDeleteProduct } from "./delete-product";

const database = Object.freeze({
  findById: jest.fn(),
  deleteById: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const deleteProduct = makeDeleteProduct({ database });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Validation", () => {
  {
    const errorCode = "PRODUCT_NOT_FOUND";
    it(`throws ewc "${errorCode}" if no product exists with the given id`, async () => {
      expect.assertions(4);

      database.findById.mockResolvedValueOnce(null);
      const id = "a";

      try {
        await deleteProduct({ id });
      } catch (ex) {
        expect(ex.code).toBe("PRODUCT_NOT_FOUND");
      }

      expect(database.findById).toHaveBeenCalledTimes(1);
      expect(database.findById).toHaveBeenCalledWith({ id });
      expect(database.deleteById).not.toHaveBeenCalled();
    });
  }
});

describe("Functionality", () => {
  it(`deletes the product if found`, async () => {
    database.findById.mockResolvedValueOnce(sampleProduct);
    const id = sampleProduct._id;

    const deleted = await deleteProduct({ id });
    expect(deleted).toEqual(sampleProduct);

    expect(database.findById).toHaveBeenCalledTimes(1);
    expect(database.deleteById).toHaveBeenCalledTimes(1);
    expect(database.findById).toHaveBeenCalledWith({ id });
    expect(database.deleteById).toHaveBeenCalledWith({ id });
  });
});
