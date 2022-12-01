import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeSearchProducts_Argument {
  database: Pick<ProductDatabase, "searchProducts">;
}
export function makeSearchProducts(
  factoryArg: MakeSearchProducts_Argument
): ProductService["searchProducts"] {
  const { database } = factoryArg;

  return async function searchProducts(arg) {
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
