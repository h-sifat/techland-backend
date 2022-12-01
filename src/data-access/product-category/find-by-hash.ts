import type { Collection } from "mongodb";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";

export interface MakeFindByHash_Argument {
  deepFreeze: <T>(o: T) => T;
  getCollection(): Pick<Collection<CategoryInterface>, "findOne">;
}
export function makeFindByHash(
  factoryArg: MakeFindByHash_Argument
): ProductCategoryDatabase["findByHash"] {
  const { deepFreeze, getCollection } = factoryArg;

  return async function findByHash(arg) {
    const { hash } = arg;

    const document = await getCollection().findOne({ hash });
    return deepFreeze(document);
  };
}
