import { EPP } from "../../common/util/epp";
import { ProductBrand } from "../../entities/product-brand";

import type { ProductBrandDatabase } from "../interfaces/product-brand-db";
import type { ProductBrandService } from "../interfaces/product-brand-service";

export interface Factory_Argument {
  database: Pick<ProductBrandDatabase, "findById" | "updateById">;
}
export function makeEditProductBrand(
  factoryArg: Factory_Argument
): ProductBrandService["editBrand"] {
  const { database } = factoryArg;

  return async function editBrand(arg) {
    const { id, changes } = arg;

    const brand = await database.findById({ id });
    if (!brand)
      throw new EPP({
        code: "NOT_FOUND",
        message: `No brand found with the id: "${id}"`,
      });

    const editedBrand = ProductBrand.edit({ brand, changes });
    await database.updateById({ id, brand: editedBrand });

    return editedBrand;
  };
}
