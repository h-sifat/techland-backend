import type {
  DBQueryMethodArgs,
  ProductBrandDatabase,
} from "../../use-cases/interfaces/product-brand-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";

export interface MakeFineById_Argument {
  deepFreeze: <T>(o: T) => T;
  collection: Pick<Collection<ProductBrandInterface>, "findOne">;
}

export function makeFindById(factoryArg: MakeFineById_Argument) {
  const { collection, deepFreeze } = factoryArg;

  return async function findById(
    arg: DBQueryMethodArgs["findById"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductBrandDatabase["findById"]> {
    const findOneArgs: [any, any] = [{ _id: arg.id }, options];
    const document = await collection.findOne(...findOneArgs);
    return deepFreeze(document);
  };
}
