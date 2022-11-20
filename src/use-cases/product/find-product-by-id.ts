import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeFindProductById_Argument {
  database: Pick<ProductDatabase, "findById">;
}

export function makeFindProductById(
  factoryArg: MakeFindProductById_Argument
): ProductService["findProductById"] {
  const { database } = factoryArg;

  return async function findProductById(arg) {
    const { id } = arg;
    return await database.findById({ id });
  };
}
