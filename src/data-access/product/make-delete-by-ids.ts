import type { Collection } from "mongodb";
import type { ProductDatabase } from "../../use-cases/interfaces/product-db";

export interface MakeDeleteByIds_Argument {
  getCollection(): Pick<Collection, "deleteMany">;
}
export function makeDeleteByIds(
  factoryArg: MakeDeleteByIds_Argument
): ProductDatabase["deleteByIds"] {
  const { getCollection } = factoryArg;

  return async function deleteByIds(arg) {
    const { ids } = arg;
    await getCollection().deleteMany({ _id: { $in: ids } });
  };
}
