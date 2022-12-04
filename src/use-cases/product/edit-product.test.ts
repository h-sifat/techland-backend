import { makeEditProduct } from "./edit-product";
import { sampleProduct } from "../../../fixtures/product";

const database = Object.freeze({
  findByIds: jest.fn(),
  updateById: jest.fn(),
});
const getDatabase = jest.fn(() => database);
const dbMethods = Object.freeze(Object.values(database));

const editProduct = makeEditProduct({ getDatabase });

beforeEach(() => {
  getDatabase.mockClear();
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
        await editProduct({ id, changes: {} });
      } catch (ex) {
        expect(ex.code).toBe("PRODUCT_NOT_FOUND");
      }

      expect(database.findByIds).toHaveBeenCalledTimes(1);
      expect(database.findByIds).toHaveBeenCalledWith({
        ids: [id],
        formatDocumentAs: "private",
      });
      expect(database.updateById).not.toHaveBeenCalled();
    });
  }

  it(`throws error if the "changes" object is invalid`, async () => {
    expect.assertions(4);

    database.findByIds.mockResolvedValueOnce([sampleProduct]);
    const id = sampleProduct._id;

    try {
      await editProduct({
        id,
        // @ts-expect-error
        changes: { name: ["Not a string"], unknown: "hi" },
      });
    } catch (ex) {
      expect(1).toBe(1);
    }

    expect(database.findByIds).toHaveBeenCalledTimes(1);
    expect(database.findByIds).toHaveBeenCalledWith({
      ids: [id],
      formatDocumentAs: "private",
    });
    expect(database.updateById).not.toHaveBeenCalled();
  });
});

describe("Functionality", () => {
  it(`edits a product`, async () => {
    database.findByIds.mockResolvedValueOnce([sampleProduct]);
    const id = sampleProduct._id;
    const changes = Object.freeze({ name: "Alexa" });

    const edited = await editProduct({ id, changes });
    expect(edited).toEqual({
      ...sampleProduct,
      ...changes,
      lastModifiedAt: expect.any(Number),
    });
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    database.findByIds.mockResolvedValueOnce([sampleProduct]);
    const id = sampleProduct._id;
    const changes = Object.freeze({ name: "Alexa" });

    const transaction: any = "wicked db transaction" + Math.random();
    await editProduct({ id, changes }, { transaction });
    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
