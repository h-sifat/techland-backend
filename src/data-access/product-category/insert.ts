import type {
  DBQueryMethodArgs,
  ProductCategoryDatabase,
} from "../../use-cases/interfaces/product-category-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { CategoryInterface } from "../../entities/product-category/interface";

export interface MakeInsert_Argument {
  collection: Pick<Collection<CategoryInterface>, "insertOne">;
}
export function makeInsert(factoryArg: MakeInsert_Argument) {
  const { collection } = factoryArg;
  return async function insert(
    document: DBQueryMethodArgs["insert"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductCategoryDatabase["insert"]> {
    const insertArgs: [any, any] = [document, options];
    await collection.insertOne(...insertArgs);
  };
}
