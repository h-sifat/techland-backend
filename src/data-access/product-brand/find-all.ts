import type { Collection } from "mongodb";
import { QueryMethodOptions } from "../util";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";
import type { ProductBrandDatabase } from "../../use-cases/interfaces/product-brand-db";

export interface MakeFineAll_Argument {
  deepFreeze: <T>(o: T) => T;
  collection: Pick<Collection<ProductBrandInterface>, "find">;
}

export function makeFindAll(factoryArg: MakeFineAll_Argument) {
  const { collection, deepFreeze } = factoryArg;

  return async function findAll(
    options: QueryMethodOptions = {}
  ): ReturnType<ProductBrandDatabase["findAll"]> {
    const findArgs: [any, any] = [{}, options];
    const documents = await collection.find(...findArgs).toArray();
    return deepFreeze(documents);
  };
}
