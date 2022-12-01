import type { Collection } from "mongodb";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";

export interface MakeUpdateById_Argument {
  getCollection(): Pick<Collection<CategoryInterface>, "replaceOne">;
}
export function makeUpdateById(
  factoryArg: MakeUpdateById_Argument
): ProductCategoryDatabase["updateById"] {
  const { getCollection } = factoryArg;

  return async function updateById(arg) {
    const { id, category } = arg;
    await getCollection().replaceOne({ _id: id }, category);
  };
}
