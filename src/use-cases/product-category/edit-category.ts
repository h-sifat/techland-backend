import { EPP } from "../../common/util/epp";
import { ProductCategory } from "../../entities/product-category";
import { GetDatabase } from "../interfaces";

import type { ProductCategoryDatabase } from "../interfaces/product-category-db";
import type { ProductCategoryService } from "../interfaces/product-category-service";

export interface MakeEditProductCategory_Argument {
  getDatabase: GetDatabase<
    Pick<ProductCategoryDatabase, "findById" | "updateById">
  >;
}
export function makeEditProductCategory(
  factoryArg: MakeEditProductCategory_Argument
): ProductCategoryService["editCategory"] {
  const { getDatabase } = factoryArg;

  return async function editCategory(arg, options = {}) {
    const database = getDatabase({ transaction: options.transaction });

    const { id, changes } = arg;

    const category = await database.findById({
      id,
      formatDocumentAs: "private",
    });
    if (!category)
      throw new EPP({
        code: "CATEGORY_NOT_FOUND",
        message: `No category found with the id: "${id}"`,
      });

    const editedCategory = ProductCategory.edit({ category, changes });
    await database.updateById({ id, category: editedCategory });

    return editedCategory;
  };
}
