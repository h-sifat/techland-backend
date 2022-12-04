import { GetDatabase } from "../interfaces";
import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

export interface MakeFindProductById_Argument {
  getDatabase: GetDatabase<Pick<ProductCategoryDatabase, "findById">>;
}

export function makeFindCategoryById(
  factoryArg: MakeFindProductById_Argument
): ProductCategoryService["findCategoryById"] {
  const { getDatabase } = factoryArg;

  return async function findCategoryById(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    const { id, formatDocumentAs } = arg;
    return await database.findById({ id, formatDocumentAs });
  };
}
