import { makeInsert } from "./insert";
import { makeFindAll } from "./find-all";
import { makeFindById } from "./find-by-id";
import { makeFindByHash } from "./find-by-hash";
import { makeUpdateById } from "./update-by-id";
import { makeFindSubCategories } from "./find-sub-categoreis";

import { makeCategoryProjectStages } from "./util";
import { addUseTransactionAndArgsFilter } from "../util";
import { deepFreeze } from "../../common/util/deep-freeze";

import type { Collection } from "mongodb";
import type { MakeDatabaseType } from "../interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";
import type { CategoryInterface } from "../../entities/product-category/interface";

export interface MakeProductCategoryDatabase_Argument {
  collectionName: string;
  imageUrlPrefix: string;
  collection: Collection<CategoryInterface>;
}
export function makeProductCategoryDatabase(
  factoryArg: MakeProductCategoryDatabase_Argument
): MakeDatabaseType<ProductCategoryDatabase> {
  const { collection, imageUrlPrefix, collectionName } = factoryArg;
  const categoryProjectStages = makeCategoryProjectStages({ imageUrlPrefix });

  // @ts-expect-error I know that the options are incompatible. TS, please shut up!
  const __database__: ProductCategoryDatabase = Object.freeze({
    findSubCategories: makeFindSubCategories({
      collection,
      deepFreeze,
      collectionName,
      categoryProjectStages,
    }),
    insert: makeInsert({ collection }),
    updateById: makeUpdateById({ collection }),
    findByHash: makeFindByHash({ collection, deepFreeze }),
    findAll: makeFindAll({ collection, deepFreeze, categoryProjectStages }),
    findById: makeFindById({ categoryProjectStages, collection, deepFreeze }),
  });

  return addUseTransactionAndArgsFilter(__database__);
}
