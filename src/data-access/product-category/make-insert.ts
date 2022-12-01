import type { Collection } from "mongodb";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";

export interface MakeInsert_Argument {
  getCollection(): Pick<Collection<CategoryInterface>, "insertOne">;
}
export function makeInsert(
  factoryArg: MakeInsert_Argument
): ProductCategoryDatabase["insert"] {
  const { getCollection } = factoryArg;
  return async function insert(document) {
    await getCollection().insertOne(document as any);
  };
}
