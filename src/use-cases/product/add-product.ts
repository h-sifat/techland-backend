import { Product } from "../../entities/product";

import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeAddProduct_Argument {
  database: Pick<ProductDatabase, "insert" | "findByName">;
}

export function makeAddProduct(
  factoryArg: MakeAddProduct_Argument
): ProductService["addProduct"] {
  const { database } = factoryArg;

  return async function addProduct(arg) {
    const { product: makeProductArg } = arg;

    const product = Product.make(makeProductArg);

    {
      const existing = await database.findByName({ name: product.name });
      if (existing) return existing;
    }

    await database.insert(product);
    return product;
  };
}
