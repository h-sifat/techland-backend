import { ProductBrand } from "../../entities/product-brand";
import { makeAddProductBrand } from "./add-brand";

const database = Object.freeze({
  insert: jest.fn(),
  findByName: jest.fn(),
});
const getDatabase = jest.fn(() => database);

const dbMethods = Object.freeze(Object.values(database));

const addProductBrand = makeAddProductBrand({ getDatabase });

const makeBrandArg = Object.freeze({ name: "Intel" });
const sampleProductBrand = ProductBrand.make(makeBrandArg);

beforeEach(() => {
  getDatabase.mockClear();
  dbMethods.forEach((method) => method.mockReset());
});

describe("Functionality", () => {
  it(`returns the existing document if one is found with the same name`, async () => {
    database.findByName.mockResolvedValueOnce(sampleProductBrand);

    const brand = await addProductBrand({ brand: makeBrandArg });

    expect(brand).toEqual(sampleProductBrand);

    expect(database.insert).not.toHaveBeenCalled();
    expect(database.findByName).toHaveBeenCalledTimes(1);
    expect(database.findByName).toHaveBeenCalledWith({
      name: sampleProductBrand.name,
    });
  });

  it(`creates a new brand if it doesn't exist`, async () => {
    database.findByName.mockResolvedValueOnce(null);

    const brand = await addProductBrand({ brand: makeBrandArg });
    expect(brand).toMatchObject(makeBrandArg);

    expect(database.insert).toHaveBeenCalledTimes(1);
    expect(database.findByName).toHaveBeenCalledTimes(1);

    expect(database.findByName).toHaveBeenCalledWith({ name: brand.name });
    expect(database.insert).toHaveBeenCalledWith(brand);
  });

  it(`passes the transaction to the getDatabase function`, async () => {
    database.findByName.mockResolvedValueOnce(sampleProductBrand);

    const transaction: any = "wicked db transaction";
    await addProductBrand({ brand: makeBrandArg }, { transaction });

    expect(getDatabase).toHaveBeenCalledWith({ transaction });
  });
});
