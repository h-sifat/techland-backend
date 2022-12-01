import type { Collection } from "mongodb";
import type { CategoryProjectStages } from "./util";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";

export interface MakeFindAll_Argument {
  deepFreeze: <T>(o: T) => T;
  categoryProjectStages: CategoryProjectStages;
  getCollection(): Pick<Collection<CategoryInterface>, "aggregate">;
}

export function makeFindAll(
  factoryArg: MakeFindAll_Argument
): ProductCategoryDatabase["findAll"] {
  const { deepFreeze, getCollection, categoryProjectStages } = factoryArg;

  return async function findAll(arg) {
    const { formatDocumentAs } = arg;

    const documents = await getCollection()
      .aggregate([{ $project: categoryProjectStages[formatDocumentAs] }])
      .toArray();

    return deepFreeze(documents) as any;
  };
}
