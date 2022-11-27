import { ProductBrandDatabase } from "../interfaces/product-brand-db";
import { ProductBrandService } from "../interfaces/product-brand-service";

export interface Factory_Argument {
  database: Pick<ProductBrandDatabase, "findAll">;
}

export function makeListProductBrands(
  factoryArg: Factory_Argument
): ProductBrandService["listBrands"] {
  const { database } = factoryArg;

  return async function listProductBrands() {
    return await database.findAll();
  };
}
