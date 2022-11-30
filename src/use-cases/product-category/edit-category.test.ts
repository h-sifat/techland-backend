import { ProductCategory } from "../../entities/product-category";
import { makeEditProductCategory } from "./edit-category";

const database = Object.freeze({
  findById: jest.fn(),
  updateById: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const editProductCategory = makeEditProductCategory({ database });
const sampleCategory = ProductCategory.make({ name: "Accessories" });
const formatDocumentAs = "private";

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Validation", () => {
  {
    const errorCode = "CATEGORY_NOT_FOUND";
    it(`throws ewc "${errorCode}" if no product-category exists with the given id`, async () => {
      expect.assertions(4);

      database.findById.mockResolvedValueOnce(null);
      const id = "a";

      try {
        await editProductCategory({ id, changes: {} });
      } catch (ex) {
        expect(ex.code).toBe(errorCode);
      }

      expect(database.findById).toHaveBeenCalledTimes(1);
      expect(database.findById).toHaveBeenCalledWith({ id, formatDocumentAs });
      expect(database.updateById).not.toHaveBeenCalled();
    });
  }

  it(`throws error if the "changes" object is invalid`, async () => {
    expect.assertions(4);

    database.findById.mockResolvedValueOnce(sampleCategory);
    const id = sampleCategory._id;

    try {
      await editProductCategory({
        id,
        // @ts-expect-error
        changes: { name: ["Not a string"], unknown: "hi" },
      });
    } catch (ex) {
      expect(1).toBe(1);
    }

    expect(database.findById).toHaveBeenCalledTimes(1);
    expect(database.findById).toHaveBeenCalledWith({ id, formatDocumentAs });
    expect(database.updateById).not.toHaveBeenCalled();
  });
});

describe("Functionality", () => {
  it(`edits a product`, async () => {
    database.findById.mockResolvedValueOnce(sampleCategory);
    const id = sampleCategory._id;
    const changes = Object.freeze({ name: "ABC" });

    const edited = await editProductCategory({ id, changes });
    expect(edited).toEqual({
      ...sampleCategory,
      ...changes,
      hash: expect.any(String),
    });
    expect(sampleCategory.hash).not.toBe(edited.hash);
  });
});
