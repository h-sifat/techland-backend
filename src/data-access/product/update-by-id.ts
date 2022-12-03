import type {
  DBQueryMethodArgs,
  ProductDatabase,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";

export interface MakeUpdateById_Argument {
  collection: Pick<Collection, "replaceOne">;
}
export function makeUpdateById(factoryArg: MakeUpdateById_Argument) {
  const { collection } = factoryArg;

  return async function updateById(
    arg: DBQueryMethodArgs["updateById"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductDatabase["updateById"]> {
    const { id: _id, product } = arg;
    const replaceOneArgs: [any, any, any] = [{ _id }, product, options];
    await collection.replaceOne(...replaceOneArgs);
  };
}
