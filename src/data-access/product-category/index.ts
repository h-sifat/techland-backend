import { makeInsert } from "./insert";
import { makeFindAll } from "./find-all";
import { makeFindById } from "./find-by-id";
import { makeFindByHash } from "./find-by-hash";
import { makeUpdateById } from "./update-by-id";
import { Collection } from "mongodb";
import { CategoryInterface } from "../../entities/product-category/interface";

import deepFreeze from "deep-freeze-strict";
import { makeCategoryProjectStages } from "./util";
import { addUseTransactionAndArgsFilter } from "../util";

import type { MakeDatabaseType } from "../interface";
import type { ProductCategoryDatabase } from "../../use-cases/interfaces/product-category-db";

export interface MakeProductCategoryDatabase_Argument {
  collection: Collection<CategoryInterface>;
  imageUrlPrefix: string;
}
export function makeProductCategoryDatabase(
  factoryArg: MakeProductCategoryDatabase_Argument
): MakeDatabaseType<ProductCategoryDatabase> {
  const { collection, imageUrlPrefix } = factoryArg;
  const categoryProjectStages = makeCategoryProjectStages({ imageUrlPrefix });

  const __database__: ProductCategoryDatabase = Object.freeze({
    insert: makeInsert({ collection }),
    updateById: makeUpdateById({ collection }),
    findByHash: makeFindByHash({ collection, deepFreeze }),
    findAll: makeFindAll({ collection, deepFreeze, categoryProjectStages }),
    findById: makeFindById({ categoryProjectStages, collection, deepFreeze }),
  });

  return addUseTransactionAndArgsFilter(__database__);
}
