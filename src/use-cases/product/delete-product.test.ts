import { sampleProduct } from "../../../fixtures/product";
import { makeDeleteProducts } from "./delete-products";

const database = Object.freeze({
  findByIds: jest.fn(),
  deleteByIds: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const deleteProduct = makeDeleteProducts({ database });

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Validation", () => {
  {
    const errorCode = "PRODUCT_NOT_FOUND";
    it(`throws ewc "${errorCode}" if no product exists with the given id`, async () => {
      expect.assertions(4);

      database.findByIds.mockResolvedValueOnce([]);
      const id = "a";

      try {
        await deleteProduct({ ids: [id] });
      } catch (ex) {
        expect(ex.code).toBe("PRODUCTS_NOT_FOUND");
      }

      expect(database.findByIds).toHaveBeenCalledTimes(1);
      expect(database.findByIds).toHaveBeenCalledWith({
        ids: [id],
        formatDocumentAs: "private",
      });
      expect(database.deleteByIds).not.toHaveBeenCalled();
    });
  }
});

describe("Functionality", () => {
  it(`deletes the product if found`, async () => {
    database.findByIds.mockResolvedValueOnce([sampleProduct]);
    const id = sampleProduct._id;

    const deleted = await deleteProduct({ ids: [id] });
    expect(deleted).toEqual([sampleProduct]);

    expect(database.findByIds).toHaveBeenCalledTimes(1);
    expect(database.deleteByIds).toHaveBeenCalledTimes(1);
    expect(database.findByIds).toHaveBeenCalledWith({
      ids: [id],
      formatDocumentAs: "private",
    });
    expect(database.deleteByIds).toHaveBeenCalledWith({ ids: [id] });
  });
});
