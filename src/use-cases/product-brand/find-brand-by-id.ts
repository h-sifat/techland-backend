import type { GetDatabase } from "../interfaces";
import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

export interface MakeFindProductById_Argument {
  getDatabase: GetDatabase<Pick<ProductBrandDatabase, "findById">>;
}

export function makeFindBrandById(
  factoryArg: MakeFindProductById_Argument
): ProductBrandService["findBrandById"] {
  const { getDatabase } = factoryArg;

  return async function findBrandById(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });

    const { id } = arg;
    return await database.findById({ id });
  };
}
