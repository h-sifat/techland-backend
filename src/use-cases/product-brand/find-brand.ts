import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

export interface MakeFindProductById_Argument {
  database: Pick<ProductBrandDatabase, "findById">;
}

export function makeFindBrandById(
  factoryArg: MakeFindProductById_Argument
): ProductBrandService["findBrandById"] {
  const { database } = factoryArg;

  return async function findBrandById(arg) {
    const { id } = arg;
    return await database.findById({ id });
  };
}
