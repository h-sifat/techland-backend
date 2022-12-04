import { GetDatabase } from "../interfaces";
import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeFindProductById_Argument {
  getDatabase: GetDatabase<Pick<ProductDatabase, "findByIds">>;
}

export function makeFindProductById(
  factoryArg: MakeFindProductById_Argument
): ProductService["findProductByIds"] {
  const { getDatabase } = factoryArg;

  return async function findProductByIds(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });
    const { ids, formatDocumentAs } = arg;
    return (await database.findByIds({ ids, formatDocumentAs })) as any;
  };
}
