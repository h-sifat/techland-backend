import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeFindSimilarProducts_Argument {
  database: Pick<ProductDatabase, "findSimilarProducts" | "findByIds">;
}
export function makeFindSimilarProducts(
  factoryArg: MakeFindSimilarProducts_Argument
): ProductService["findSimilarProducts"] {
  const { database } = factoryArg;

  return async function findSimilarProducts(arg) {
    const { id, count } = arg;

    const products = await database.findByIds({
      ids: [id],
      formatDocumentAs: "private",
    });

    if (!products.length) return [];

    const similarProducts = await database.findSimilarProducts({
      count,
      product: products[0],
    });

    return similarProducts;
  };
}
