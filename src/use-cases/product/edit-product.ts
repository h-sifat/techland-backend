import { EPP } from "../../common/util/epp";
import { Product } from "../../entities/product";
import { GetDatabase } from "../interfaces";

import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeEditProduct_Argument {
  getDatabase: GetDatabase<Pick<ProductDatabase, "findByIds" | "updateById">>;
}
export function makeEditProduct(
  factoryArg: MakeEditProduct_Argument
): ProductService["editProduct"] {
  const { getDatabase } = factoryArg;

  return async function editProduct(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    const { id, changes } = arg;

    const products = await database.findByIds({
      ids: [id],
      formatDocumentAs: "private",
    });
    if (!products.length)
      throw new EPP({
        code: "PRODUCT_NOT_FOUND",
        message: `No product found with the id: "${id}"`,
      });

    const editedProduct = Product.edit({ product: products[0], changes });
    await database.updateById({ id, product: editedProduct });

    return editedProduct;
  };
}
