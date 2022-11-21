import { makeId } from "../../common/util";
import { ProductCategory } from "../../entities/product-category";
import { makeAddProductCategory } from "./add-category";

const database = Object.freeze({
  insert: jest.fn(),
  findByHash: jest.fn(),
});
const dbMethods = Object.freeze(Object.values(database));

const addProductCategory = makeAddProductCategory({ database });

const makeCategoryArg = Object.freeze({
  name: "Components",
  parentId: makeId(),
});
const sampleProductCategory = ProductCategory.make(makeCategoryArg);

beforeEach(() => {
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns the existing document if one is found with the same hash`, async () => {
    database.findByHash.mockResolvedValueOnce(sampleProductCategory);

    const category = await addProductCategory({ category: makeCategoryArg });

    expect(category).toEqual(sampleProductCategory);

    expect(database.insert).not.toHaveBeenCalled();
    expect(database.findByHash).toHaveBeenCalledTimes(1);
    expect(database.findByHash).toHaveBeenCalledWith({
      hash: sampleProductCategory.hash,
    });
  });

  it(`creates a new category if it doesn't exist`, async () => {
    database.findByHash.mockResolvedValueOnce(null);

    const category = await addProductCategory({ category: makeCategoryArg });
    expect(category).toMatchObject(makeCategoryArg);

    expect(database.insert).toHaveBeenCalledTimes(1);
    expect(database.findByHash).toHaveBeenCalledTimes(1);

    expect(database.findByHash).toHaveBeenCalledWith({ hash: category.hash });
    expect(database.insert).toHaveBeenCalledWith(category);
  });
});
