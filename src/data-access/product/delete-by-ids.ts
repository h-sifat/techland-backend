import type {
  DBQueryMethodArgs,
  ProductDatabase,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";

export interface MakeDeleteByIds_Argument {
  collection: Pick<Collection, "deleteMany">;
}
export function makeDeleteByIds(factoryArg: MakeDeleteByIds_Argument) {
  const { collection } = factoryArg;

  return async function deleteByIds(
    arg: DBQueryMethodArgs["deleteByIds"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductDatabase["deleteByIds"]> {
    const { ids } = arg;
    const deleteManyArgs: [any, any] = [{ _id: { $in: ids } }, options];
    await collection.deleteMany(...deleteManyArgs);
  };
}
