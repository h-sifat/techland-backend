import type { Collection } from "mongodb";
import type { ProductDatabase } from "../../use-cases/interfaces/product-db";

export interface MakeInsert_Argument {
  collection: Collection;
}
export function makeInsert(
  factoryArg: MakeInsert_Argument
): ProductDatabase["insert"] {
  const { collection } = factoryArg;
  return async function insert(product) {
    await collection.insertOne(product as any);
  };
}
