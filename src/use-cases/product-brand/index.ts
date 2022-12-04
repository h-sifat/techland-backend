import type { MakeDatabaseType } from "../../data-access/interface";
import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

import { makeGetDatabase } from "../util";
import { makeAddProductBrand } from "./add-brand";
import { makeEditProductBrand } from "./edit-brand";
import { makeListProductBrands } from "./list-brands";
import { makeFindBrandById } from "./find-brand-by-id";

export interface MakeProductBrandService_Argument {
  database: MakeDatabaseType<ProductBrandDatabase>;
}

export function makeProductBrandService(
  factoryArg: MakeProductBrandService_Argument
) {
  const { database } = factoryArg;
  const getDatabase = makeGetDatabase(database);

  const service: ProductBrandService = {
    addBrand: makeAddProductBrand({ getDatabase }),
    editBrand: makeEditProductBrand({ getDatabase }),
    findBrandById: makeFindBrandById({ getDatabase }),
    listBrands: makeListProductBrands({ getDatabase }),
  };

  return Object.freeze(service);
}
