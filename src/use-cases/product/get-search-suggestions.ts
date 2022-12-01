import type { ProductDatabase } from "../interfaces/product-db";
import { ProductService } from "../interfaces/product-service";

export interface MakeGetSearchSuggestions_Argument {
  database: Pick<ProductDatabase, "getSearchSuggestions">;
}
export function makeGetSearchSuggestions(
  factoryArg: MakeGetSearchSuggestions_Argument
): ProductService["getSearchSuggestions"] {
  const { database } = factoryArg;

  return async function getSearchSuggestions(arg) {
    const { query, brandId, categoryId, count } = arg;
    return await database.getSearchSuggestions({
      count,
      query,
      brandId,
      categoryId,
    });
  };
}
