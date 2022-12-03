import type {
  DBQueryMethodArgs,
  ProductBrandDatabase,
} from "../../use-cases/interfaces/product-brand-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";

export interface MakeInsert_Argument {
  collection: Pick<Collection<ProductBrandInterface>, "insertOne">;
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
