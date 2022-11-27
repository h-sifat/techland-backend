import { ProductBrand } from "../../entities/product-brand";

import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

interface FactoryArgument {
  database: Pick<ProductBrandDatabase, "findByName" | "insert">;
}

export function makeAddProductBrand(
  factoryArg: FactoryArgument
): ProductBrandService["addBrand"] {
  const { database } = factoryArg;
  return async function addProductBrand(arg) {
    const brand = ProductBrand.make(arg.brand);

    {
      const existing = await database.findByName({ name: brand.name });
      if (existing) return existing;
    }

    await database.insert(brand);
    return brand;
  };
}
