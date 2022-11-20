import { EPP } from "../../common/util/epp";
import { Product } from "../../entities/product";

import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeEditProduct_Argument {
  database: Pick<ProductDatabase, "findById" | "updateById">;
}
export function makeEditProduct(
  factoryArg: MakeEditProduct_Argument
): ProductService["editProduct"] {
  const { database } = factoryArg;

  return async function editProduct(arg) {
    const { id, changes } = arg;

    const product = await database.findById({ id });
    if (!product)
      throw new EPP({
        code: "PRODUCT_NOT_FOUND",
        message: `No product found with the id: "${id}"`,
      });

    const editedProduct = Product.edit({ product, changes });
    await database.updateById({ id, product: editedProduct });

    return editedProduct;
  };
}
