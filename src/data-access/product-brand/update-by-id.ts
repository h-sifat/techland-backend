import type {
  DBQueryMethodArgs,
  ProductBrandDatabase,
} from "../../use-cases/interfaces/product-brand-db";
import type { Collection } from "mongodb";
import { QueryMethodOptions } from "../util";

export interface MakeUpdateById_Argument {
  collection: Pick<Collection, "replaceOne">;
}

export function makeUpdateById(factoryArg: MakeUpdateById_Argument) {
  const { collection } = factoryArg;

  return async function updateById(
    arg: DBQueryMethodArgs["updateById"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductBrandDatabase["updateById"]> {
    const { id, document } = arg;
    const replaceOneArgs: [any, any, any] = [{ _id: id }, document, options];
    await collection.replaceOne(...replaceOneArgs);
  };
}
