import type {
  DBQueryMethodArgs,
  ProductBrandDatabase,
} from "../../use-cases/interfaces/product-brand-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";

export interface MakeFindByName_Argument {
  deepFreeze<T>(o: T): T;
  collection: Pick<Collection<ProductBrandInterface>, "findOne">;
}

export function makeFindByName(factoryArg: MakeFindByName_Argument) {
  const { collection, deepFreeze } = factoryArg;

  return async function findByName(
    arg: DBQueryMethodArgs["findByName"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductBrandDatabase["findByName"]> {
    const { name } = arg;
    const findOneArgs: [any, any] = [{ name }, options];

    const document = await collection.findOne(...findOneArgs);
    return deepFreeze(document);
  };
}
