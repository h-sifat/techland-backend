import type { Collection } from "mongodb";
import type { ProductDatabase } from "../../use-cases/interfaces/product-db";

export interface MakeInsert_Argument {
  getCollection(): Pick<Collection, "insertOne">;
}
export function makeInsert(
  factoryArg: MakeInsert_Argument
): ProductDatabase["insert"] {
  const { getCollection } = factoryArg;
  return async function insert(product) {
    await getCollection().insertOne(product as any);
  };
}
