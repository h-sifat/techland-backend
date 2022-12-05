import { makeGetCategories } from "./get-categories";

import type { ProductCategoryController } from "../interface/product-category";
import type { ProductCategoryService } from "../../use-cases/interfaces/product-category-service";

export interface MakeProductCategoryController_Argument {
  CategoryService: ProductCategoryService;
}

export function makeProductCategoryController(
  factoryArg: MakeProductCategoryController_Argument
): ProductCategoryController {
  const { CategoryService } = factoryArg;

  const controller: ProductCategoryController = {
    get: makeGetCategories({ CategoryService }),
  };

  return Object.freeze(controller);
}
