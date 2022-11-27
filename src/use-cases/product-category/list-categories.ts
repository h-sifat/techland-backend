import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

export interface MakeListProductCategories_Argument {
  database: Pick<ProductCategoryDatabase, "findAll">;
}

export function makeListProductCategories(
  factoryArg: MakeListProductCategories_Argument
): ProductCategoryService["listCategories"] {
  const { database } = factoryArg;

  return async function listProductCategories(options) {
    return await database.findAll(options);
  };
}
