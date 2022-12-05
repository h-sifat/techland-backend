import type { ProductController } from "../interface/product";
import type { WithTransaction } from "../../data-access/interface";
import type { ProductService } from "../../use-cases/interfaces/product-service";
import type { ProductCategoryService } from "../../use-cases/interfaces/product-category-service";

import { makeGetProducts, MakeGetProducts_Argument } from "./get-products";

export interface MakeProductController_Argument {
  ProductService: ProductService;
  WithTransaction: WithTransaction;
  CategoryService: ProductCategoryService;
  config: MakeGetProducts_Argument["config"];
}
export function makeProductController(
  factoryArg: MakeProductController_Argument
): ProductController {
  const { ProductService, CategoryService, WithTransaction, config } =
    factoryArg;

  const controller: ProductController = {
    get: makeGetProducts({
      config,
      ProductService,
      CategoryService,
      WithTransaction,
    }),
  };

  return Object.freeze(controller);
}
