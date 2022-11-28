import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface FactoryArgument {
  database: Pick<ProductDatabase, "find">;
}

export function makeListProducts(
  factoryArg: FactoryArgument
): ProductService["listProducts"] {
  const { database } = factoryArg;

  return async function listProducts(arg) {
    return (await database.find(arg)) as any;
  };
}
