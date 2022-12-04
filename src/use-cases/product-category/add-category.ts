import { ProductCategory } from "../../entities/product-category";
import type { GetDatabase } from "../interfaces";

import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

interface FactoryArgument {
  getDatabase: GetDatabase<
    Pick<ProductCategoryDatabase, "findByHash" | "insert">
  >;
}

export function makeAddProductCategory(
  factoryArg: FactoryArgument
): ProductCategoryService["addCategory"] {
  const { getDatabase } = factoryArg;
  return async function addProductCategory(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });

    const category = ProductCategory.make(arg.category);

    {
      const existing = await database.findByHash({ hash: category.hash });
      if (existing) return existing;
    }

    await database.insert(category);
    return category;
  };
}
