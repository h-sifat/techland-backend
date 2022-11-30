import { EPP } from "../../common/util/epp";
import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeDeleteProduct_Argument {
  database: Pick<ProductDatabase, "findByIds" | "deleteByIds">;
}
export function makeDeleteProducts(
  factoryArg: MakeDeleteProduct_Argument
): ProductService["deleteProducts"] {
  const { database } = factoryArg;

  return async function deleteProducts(arg) {
    const { ids } = arg;

    const products = await database.findByIds({
      ids,
      formatDocumentAs: "private",
    });

    if (!products.length)
      throw new EPP({
        code: "PRODUCTS_NOT_FOUND",
        message: `No products found with the ids`,
      });

    await database.deleteByIds({ ids });
    return products;
  };
}
