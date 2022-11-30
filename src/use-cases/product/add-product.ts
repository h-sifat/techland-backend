import { Product } from "../../entities/product";

import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeAddProduct_Argument {
  database: Pick<ProductDatabase, "insert">;
}

export function makeAddProduct(
  factoryArg: MakeAddProduct_Argument
): ProductService["addProduct"] {
  const { database } = factoryArg;

  return async function addProduct(arg) {
    const { product: makeProductArg } = arg;

    // @TODO do not insert duplicate products
    const product = Product.make(makeProductArg);

    await database.insert(product);
    return product;
  };
}
