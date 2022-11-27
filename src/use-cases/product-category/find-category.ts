import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

export interface MakeFindProductById_Argument {
  database: Pick<ProductCategoryDatabase, "findById">;
}

export function makeFindCategoryById(
  factoryArg: MakeFindProductById_Argument
): ProductCategoryService["findCategoryById"] {
  const { database } = factoryArg;

  return async function findCategoryById(arg, options) {
    const { id } = arg;
    return await database.findById({ id }, options);
  };
}
