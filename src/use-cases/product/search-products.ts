import { GetDatabase } from "../interfaces";
import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeSearchProducts_Argument {
  getDatabase: GetDatabase<Pick<ProductDatabase, "searchProducts">>;
}
export function makeSearchProducts(
  factoryArg: MakeSearchProducts_Argument
): ProductService["searchProducts"] {
  const { getDatabase } = factoryArg;

  return async function searchProducts(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    const { query, brandId, categoryId, formatDocumentAs, pagination } = arg;

    return await database.searchProducts({
      query,
      brandId,
      categoryId,
      pagination,
      formatDocumentAs,
    });
  };
}
