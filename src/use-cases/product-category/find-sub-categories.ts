import type { GetDatabase } from "../interfaces";
import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

export interface MakeFindSubCategories_Argument {
  getDatabase: GetDatabase<Pick<ProductCategoryDatabase, "findSubCategories">>;
}

export function makeFindSubCategories(
  factoryArg: MakeFindSubCategories_Argument
): ProductCategoryService["findSubCategories"] {
  const { getDatabase } = factoryArg;

  return async function findSubCategories(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });

    const { id, formatDocumentAs } = arg;
    return await database.findSubCategories({ id, formatDocumentAs });
  };
}
