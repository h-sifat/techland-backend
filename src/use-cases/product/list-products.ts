import { GetDatabase } from "../interfaces";
import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface FactoryArgument {
  getDatabase: GetDatabase<Pick<ProductDatabase, "find">>;
}

export function makeListProducts(
  factoryArg: FactoryArgument
): ProductService["listProducts"] {
  const { getDatabase } = factoryArg;

  return async function listProducts(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    return (await database.find(arg)) as any;
  };
}
