import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { CategoryProjectStages } from "./util";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { DBQueryMethodArgs } from "../../use-cases/interfaces/product-category-db";

export interface MakeFindById_Argument {
  deepFreeze: <T>(o: T) => T;
  categoryProjectStages: CategoryProjectStages;
  collection: Pick<Collection<CategoryInterface>, "aggregate">;
}

export function makeFindById(factoryArg: MakeFindById_Argument) {
  const { deepFreeze, collection, categoryProjectStages } = factoryArg;

  return async function findById(
    arg: DBQueryMethodArgs["findById"],
    options: QueryMethodOptions = {}
  ): Promise<any> {
    const { id, formatDocumentAs } = arg;

    const aggregateArgs: [any, any] = [
      [
        { $match: { _id: id } },
        { $project: categoryProjectStages[formatDocumentAs] },
      ],
      options,
    ];

    const result = await collection.aggregate(...aggregateArgs).toArray();
    return deepFreeze(result[0]) as any;
  };
}
