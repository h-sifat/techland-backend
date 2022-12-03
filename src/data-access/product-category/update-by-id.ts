import type {
  DBQueryMethodArgs,
  ProductCategoryDatabase,
} from "../../use-cases/interfaces/product-category-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { CategoryInterface } from "../../entities/product-category/interface";

export interface MakeUpdateById_Argument {
  collection: Pick<Collection<CategoryInterface>, "replaceOne">;
}
export function makeUpdateById(factoryArg: MakeUpdateById_Argument) {
  const { collection } = factoryArg;

  return async function updateById(
    arg: DBQueryMethodArgs["updateById"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductCategoryDatabase["updateById"]> {
    const { id: _id, category } = arg;
    const replaceOneArgs: [any, any, any] = [{ _id }, category, options];
    await collection.replaceOne(...replaceOneArgs);
  };
}
