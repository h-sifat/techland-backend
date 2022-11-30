import type { Collection } from "mongodb";
import type { ProductDatabase } from "../../use-cases/interfaces/product-db";

export interface MakeUpdateById_Argument {
  getCollection(): Pick<Collection, "replaceOne">;
}
export function makeUpdateById(
  factoryArg: MakeUpdateById_Argument
): ProductDatabase["updateById"] {
  const { getCollection } = factoryArg;

  return async function updateById(arg) {
    const { id, product } = arg;
    await getCollection().replaceOne({ _id: id }, product);
  };
}
