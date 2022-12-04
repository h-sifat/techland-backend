import type { MakeDatabaseType } from "../../data-access/interface";
import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

import { makeGetDatabase } from "../util";
import { makeFindCategoryById } from "./find-category";
import { makeAddProductCategory } from "./add-category";
import { makeEditProductCategory } from "./edit-category";
import { makeFindSubCategories } from "./find-sub-categories";
import { makeListProductCategories } from "./list-categories";

export interface MakeProductCategoryService_Argument {
  database: MakeDatabaseType<ProductCategoryDatabase>;
}

export function makeProductCategoryService(
  factoryArg: MakeProductCategoryService_Argument
) {
  const { database } = factoryArg;
  const getDatabase = makeGetDatabase(database);

  const service: ProductCategoryService = {
    addCategory: makeAddProductCategory({ getDatabase }),
    editCategory: makeEditProductCategory({ getDatabase }),
    findCategoryById: makeFindCategoryById({ getDatabase }),
    findSubCategories: makeFindSubCategories({ getDatabase }),
    listCategories: makeListProductCategories({ getDatabase }),
  };

  return Object.freeze(service);
}
