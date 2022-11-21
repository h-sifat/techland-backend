import type {
  EditCategory_Argument,
  MakeCategory_Argument,
} from "../../entities/product-category/make-category-entity";
import type { DBQueryMethodArgs } from "./product-category-db";
import type { CategoryInterface } from "../../entities/product-category/interface";

export interface ServiceArguments {
  addCategory: { category: MakeCategory_Argument };
  editCategory: {
    category: CategoryInterface;
    changes: EditCategory_Argument["changes"];
  };
  findCategoryById: DBQueryMethodArgs["findById"];
}

type CategoryResponse = Promise<Readonly<CategoryInterface>>;
export interface ProductCategoryService {
  findCategoryById(
    arg: ServiceArguments["findCategoryById"]
  ): Promise<Readonly<CategoryInterface> | null>;
  listCategories(): Promise<Readonly<CategoryInterface>[]>;
  addCategory(arg: ServiceArguments["addCategory"]): CategoryResponse;
  editCategory(arg: ServiceArguments["editCategory"]): CategoryResponse;
}
