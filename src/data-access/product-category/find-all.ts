import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { CategoryProjectStages } from "./util";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { DBQueryMethodArgs } from "../../use-cases/interfaces/product-category-db";

export interface MakeFindAll_Argument {
  deepFreeze: <T>(o: T) => T;
  categoryProjectStages: CategoryProjectStages;
  collection: Pick<Collection<CategoryInterface>, "aggregate">;
}

export function makeFindAll(factoryArg: MakeFindAll_Argument) {
  const { deepFreeze, collection, categoryProjectStages } = factoryArg;

  return async function findAll(
    arg: DBQueryMethodArgs["findAll"],
    options: QueryMethodOptions = {}
  ): Promise<any> {
    const { formatDocumentAs } = arg;

    const aggregateArgs: [any, any] = [
      [{ $project: categoryProjectStages[formatDocumentAs] }],
      options,
    ];

    const documents = await collection.aggregate(...aggregateArgs).toArray();
    return deepFreeze(documents) as any;
  };
}
