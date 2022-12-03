import type {
  DBQueryMethodArgs,
  ProductBrandDatabase,
} from "../../use-cases/interfaces/product-brand-db";
import type { Collection } from "mongodb";
import { QueryMethodOptions } from "../util";

export interface MakeInsert_Argument {
  collection: Pick<Collection, "insertOne">;
}

export function makeInsert(factoryArg: MakeInsert_Argument) {
  const { collection } = factoryArg;

  return async function insert(
    document: DBQueryMethodArgs["insert"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductBrandDatabase["insert"]> {
    const insertArgs: [any, any] = [document, options];
    await collection.insertOne(...insertArgs);
  };
}
