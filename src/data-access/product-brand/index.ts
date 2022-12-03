import { makeInsert } from "./insert";
import { makeFindAll } from "./find-all";
import { makeFindById } from "./find-by-id";
import { makeFindByName } from "./find-by-name";
import { makeUpdateById } from "./update-by-id";

import { deepFreeze } from "../../common/util/deep-freeze";
import { addUseTransactionAndArgsFilter } from "../util";

import type { Collection } from "mongodb";
import type { MakeDatabaseType } from "../interface";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";
import type { ProductBrandDatabase } from "../../use-cases/interfaces/product-brand-db";

export interface MakeProductBrandDatabase_Argument {
  collection: Collection<ProductBrandInterface>;
}

export function makeProductBrandDatabase(
  factoryArg: MakeProductBrandDatabase_Argument
): MakeDatabaseType<ProductBrandDatabase> {
  const { collection } = factoryArg;

  const __database__: ProductBrandDatabase = Object.freeze({
    insert: makeInsert({ collection }),
    updateById: makeUpdateById({ collection }),
    findAll: makeFindAll({ collection, deepFreeze }),
    findById: makeFindById({ collection, deepFreeze }),
    findByName: makeFindByName({ collection, deepFreeze }),
  });

  return addUseTransactionAndArgsFilter(__database__);
}
