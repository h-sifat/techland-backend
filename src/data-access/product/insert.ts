import type {
  DBQueryMethodArgs,
  ProductDatabase,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";

export interface MakeInsert_Argument {
  collection: Pick<Collection, "insertOne">;
}
export function makeInsert(factoryArg: MakeInsert_Argument) {
  const { collection } = factoryArg;
  return async function insert(
    product: DBQueryMethodArgs["insert"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductDatabase["insert"]> {
    const insertArgs: [any, any] = [product, options];
    await collection.insertOne(...insertArgs);
  };
}
