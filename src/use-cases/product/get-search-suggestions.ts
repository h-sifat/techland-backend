import { GetDatabase } from "../interfaces";
import type { ProductDatabase } from "../interfaces/product-db";
import { ProductService } from "../interfaces/product-service";

export interface MakeGetSearchSuggestions_Argument {
  getDatabase: GetDatabase<Pick<ProductDatabase, "getSearchSuggestions">>;
}
export function makeGetSearchSuggestions(
  factoryArg: MakeGetSearchSuggestions_Argument
): ProductService["getSearchSuggestions"] {
  const { getDatabase } = factoryArg;

  return async function getSearchSuggestions(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    const { query, brandId, categoryId, count } = arg;
    return await database.getSearchSuggestions({
      count,
      query,
      brandId,
      categoryId,
    });
  };
}
