import type {
  DBQueryMethodArgs,
  ProductCategoryDatabase,
} from "../../use-cases/interfaces/product-category-db";
import type { QueryMethodOptions } from "../util";
import type { Collection } from "mongodb";
import type { CategoryInterface } from "../../entities/product-category/interface";

export interface MakeFindByHash_Argument {
  deepFreeze: <T>(o: T) => T;
  collection: Pick<Collection<CategoryInterface>, "findOne">;
}
export function makeFindByHash(factoryArg: MakeFindByHash_Argument) {
  const { deepFreeze, collection } = factoryArg;

  return async function findByHash(
    arg: DBQueryMethodArgs["findByHash"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductCategoryDatabase["findByHash"]> {
    const findOneArgs: [any, any] = [{ hash: arg.hash }, options];

    const document = await collection.findOne(...findOneArgs);
    return deepFreeze(document);
  };
}
