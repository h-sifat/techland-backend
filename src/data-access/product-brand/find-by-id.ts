import type { Collection } from "mongodb";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";
import type { ProductBrandDatabase } from "../../use-cases/interfaces/product-brand-db";

export interface MakeFineById_Argument {
  deepFreeze: <T>(o: T) => T;
  getCollection(): Pick<Collection<ProductBrandInterface>, "findOne">;
}
export function makeFindById(
  factoryArg: MakeFineById_Argument
): ProductBrandDatabase["findById"] {
  const { getCollection, deepFreeze } = factoryArg;

  return async function findById(arg) {
    const { id } = arg;
    const document = await getCollection().findOne({ _id: id });

    return deepFreeze(document);
  };
}
