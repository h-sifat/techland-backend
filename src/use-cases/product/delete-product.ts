import { EPP } from "../../common/util/epp";
import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeDeleteProduct_Argument {
  database: Pick<ProductDatabase, "findByIds" | "deleteById">;
}
export function makeDeleteProduct(
  factoryArg: MakeDeleteProduct_Argument
): ProductService["removeProduct"] {
  const { database } = factoryArg;

  return async function deleteProduct(arg) {
    const { id } = arg;

    const products = await database.findByIds({
      ids: [id],
      formatDocumentAs: "private",
    });
    if (!products.length)
      throw new EPP({
        code: "PRODUCT_NOT_FOUND",
        message: `No product found with the id: "${id}"`,
      });

    await database.deleteById({ id });
    return products[0];
  };
}
