import type { Collection } from "mongodb";
import type { ProductBrandDatabase } from "../../use-cases/interfaces/product-brand-db";

export interface MakeUpdateById_Argument {
  getCollection(): Pick<Collection, "replaceOne">;
}
export function makeUpdateById(
  factoryArg: MakeUpdateById_Argument
): ProductBrandDatabase["updateById"] {
  const { getCollection } = factoryArg;

  return async function updateById(arg) {
    const { id, document } = arg;
    await getCollection().replaceOne({ _id: id }, document);
  };
}
