import type { Collection } from "mongodb";
import type { ProductBrandDatabase } from "../../use-cases/interfaces/product-brand-db";

export interface MakeInsert_Argument {
  getCollection(): Pick<Collection, "insertOne">;
}
export function makeInsert(
  factoryArg: MakeInsert_Argument
): ProductBrandDatabase["insert"] {
  const { getCollection } = factoryArg;
  return async function insert(document) {
    await getCollection().insertOne(document as any);
  };
}
