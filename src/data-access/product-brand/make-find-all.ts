import type { Collection } from "mongodb";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";
import type { ProductBrandDatabase } from "../../use-cases/interfaces/product-brand-db";

export interface MakeFineAll_Argument {
  deepFreeze: <T>(o: T) => T;
  getCollection(): Pick<Collection<ProductBrandInterface>, "find">;
}

export function makeFindAll(
  factoryArg: MakeFineAll_Argument
): ProductBrandDatabase["findAll"] {
  const { getCollection, deepFreeze } = factoryArg;
  return async function findAll() {
    const documents = await getCollection().find().toArray();
    return deepFreeze(documents);
  };
}
