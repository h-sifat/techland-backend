import { Product } from "../../entities/product";
import { GetDatabase } from "../interfaces";

import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeAddProduct_Argument {
  getDatabase: GetDatabase<Pick<ProductDatabase, "insert">>;
}

export function makeAddProduct(
  factoryArg: MakeAddProduct_Argument
): ProductService["addProduct"] {
  const { getDatabase } = factoryArg;

  return async function addProduct(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });

    const { product: makeProductArg } = arg;

    // @TODO do not insert duplicate products
    const product = Product.make(makeProductArg);

    await database.insert(product);
    return product;
  };
}
