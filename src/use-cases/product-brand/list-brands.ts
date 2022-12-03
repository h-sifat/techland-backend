import type { GetDatabase } from "../interfaces";
import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

export interface Factory_Argument {
  getDatabase: GetDatabase<Pick<ProductBrandDatabase, "findAll">>;
}

export function makeListProductBrands(
  factoryArg: Factory_Argument
): ProductBrandService["listBrands"] {
  const { getDatabase } = factoryArg;

  return async function listProductBrands(options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    return await database.findAll();
  };
}
