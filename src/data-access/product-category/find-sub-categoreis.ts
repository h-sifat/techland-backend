import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { CategoryProjectStages } from "./util";
import type { CategoryInterface } from "../../entities/product-category/interface";
import type { DBQueryMethodArgs } from "../../use-cases/interfaces/product-category-db";

export interface MakeFindSubCategories_Argument {
  collectionName: string;
  deepFreeze: <T>(o: T) => T;
  categoryProjectStages: CategoryProjectStages;
  collection: Pick<Collection<CategoryInterface>, "aggregate">;
}

export function makeFindSubCategories(
  factoryArg: MakeFindSubCategories_Argument
) {
  const { collection, deepFreeze, collectionName, categoryProjectStages } =
    factoryArg;

  return async function findSubCategories(
    arg: DBQueryMethodArgs["findSubCategories"],
    options: QueryMethodOptions = {}
  ) {
    const { id, formatDocumentAs } = arg;

    const childrenArrayName = "children";
    const aggregationPipeline = [
      { $match: { _id: id } },
      {
        $graphLookup: {
          as: childrenArrayName,
          startWith: "$_id",
          from: collectionName,
          connectFromField: "_id",
          connectToField: "parentId",
        },
      },
      {
        $project: {
          children: { $concatArrays: [`$${childrenArrayName}`, ["$$ROOT"]] },
        },
      },
      { $unwind: `$${childrenArrayName}` },
      { $replaceRoot: { newRoot: `$${childrenArrayName}` } },
      { $project: categoryProjectStages[formatDocumentAs] },
    ];

    const aggregateArgs: [any, any] = [aggregationPipeline, options];
    const result = await collection.aggregate(...aggregateArgs).toArray();

    return deepFreeze(result) as any[];
  };
}
