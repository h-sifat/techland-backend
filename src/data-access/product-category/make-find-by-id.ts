import type { Collection } from "mongodb";
import type { CategoryProjectStages } from "./util";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";

export interface MakeFindById_Argument {
  deepFreeze: <T>(o: T) => T;
  categoryProjectStages: CategoryProjectStages;
  getCollection(): Pick<Collection<CategoryInterface>, "aggregate">;
}

export function makeFindById(
  factoryArg: MakeFindById_Argument
): ProductCategoryDatabase["findById"] {
  const { deepFreeze, getCollection, categoryProjectStages } = factoryArg;

  return async function findById(arg) {
    const { id, formatDocumentAs } = arg;

    const result = await getCollection()
      .aggregate([
        { $match: { _id: id } },
        { $project: categoryProjectStages[formatDocumentAs] },
      ])
      .toArray();

    return deepFreeze(result[0]) as any;
  };
}
