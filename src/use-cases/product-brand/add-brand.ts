import { ProductBrand } from "../../entities/product-brand";

import type { GetDatabase } from "../interfaces";
import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

interface FactoryArgument {
  getDatabase: GetDatabase<Pick<ProductBrandDatabase, "findByName" | "insert">>;
}

export function makeAddProductBrand(
  factoryArg: FactoryArgument
): ProductBrandService["addBrand"] {
  const { getDatabase } = factoryArg;

  return async function addProductBrand(arg, options = {}) {
    const brand = ProductBrand.make(arg.brand);

    const database = getDatabase({ transaction: options?.transaction });

    {
      const existing = await database.findByName({ name: brand.name });
      if (existing) return existing;
    }

    await database.insert(brand);
    return brand;
  };
}
