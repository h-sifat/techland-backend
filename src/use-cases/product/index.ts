import type { ProductDatabase } from "../interfaces/product-db";
import type { MakeDatabaseType } from "../../data-access/interface";
import type { ProductService } from "../interfaces/product-service";

import { makeGetDatabase } from "../util";
import { makeAddProduct } from "./add-product";
import { makeEditProduct } from "./edit-product";
import { makeListProducts } from "./list-products";
import { makeDeleteProducts } from "./delete-products";
import { makeSearchProducts } from "./search-products";
import { makeFindProductByIds } from "./find-product-by-ids";
import { makeFindSimilarProducts } from "./find-similar-products";
import { makeGetSearchSuggestions } from "./get-search-suggestions";

export interface MakeProductService_Argument {
  database: MakeDatabaseType<ProductDatabase>;
}
export function makeProductService(factoryArg: MakeProductService_Argument) {
  const { database } = factoryArg;
  const getDatabase = makeGetDatabase(database);

  const service: ProductService = {
    addProduct: makeAddProduct({ getDatabase }),
    editProduct: makeEditProduct({ getDatabase }),
    listProducts: makeListProducts({ getDatabase }),
    deleteProducts: makeDeleteProducts({ getDatabase }),
    searchProducts: makeSearchProducts({ getDatabase }),
    findProductByIds: makeFindProductByIds({ getDatabase }),
    findSimilarProducts: makeFindSimilarProducts({ getDatabase }),
    getSearchSuggestions: makeGetSearchSuggestions({ getDatabase }),
  };

  return Object.freeze(service);
}
