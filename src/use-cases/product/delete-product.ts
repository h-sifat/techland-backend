import { EPP } from "../../common/util/epp";
import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeDeleteProduct_Argument {
  database: Pick<ProductDatabase, "findById" | "deleteById">;
}
export function makeDeleteProduct(
  factoryArg: MakeDeleteProduct_Argument
): ProductService["removeProduct"] {
  const { database } = factoryArg;

  return async function deleteProduct(arg) {
    const { id } = arg;

    const product = await database.findById({ id });
    if (!product)
      throw new EPP({
        code: "PRODUCT_NOT_FOUND",
        message: `No product found with the id: "${id}"`,
      });

    await database.deleteById({ id });
    return product;
  };
}
