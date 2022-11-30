import type { ProductDatabase } from "../interfaces/product-db";
import type { ProductService } from "../interfaces/product-service";

export interface MakeFindProductById_Argument {
  database: Pick<ProductDatabase, "findByIds">;
}

export function makeFindProductById(
  factoryArg: MakeFindProductById_Argument
): ProductService["findProductByIds"] {
  const { database } = factoryArg;

  return async function findProductByIds(arg) {
    const { ids, formatDocumentAs } = arg;
    return (await database.findByIds({ ids, formatDocumentAs })) as any;
  };
}
