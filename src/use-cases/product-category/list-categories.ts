import { GetDatabase } from "../interfaces";
import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

export interface MakeListProductCategories_Argument {
  getDatabase: GetDatabase<Pick<ProductCategoryDatabase, "findAll">>;
}

export function makeListProductCategories(
  factoryArg: MakeListProductCategories_Argument
): ProductCategoryService["listCategories"] {
  const { getDatabase } = factoryArg;

  return async function listProductCategories(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    return await database.findAll(arg);
  };
}
