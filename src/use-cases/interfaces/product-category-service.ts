import type {
  EditCategory_Argument,
  MakeCategory_Argument,
} from "../../entities/product-category/make-category-entity";
import type { DBQueryMethodArgs } from "./product-category-db";
import type { CategoryPrivateInterface } from "../../entities/product-category/interface";

export interface ServiceArguments {
  addCategory: { category: MakeCategory_Argument };
  editCategory: {
    id: string;
    changes: EditCategory_Argument["changes"];
  };
  findCategoryById: DBQueryMethodArgs["findById"];
}

type CategoryResponse = Promise<Readonly<CategoryPrivateInterface>>;
export interface ProductCategoryService {
  findCategoryById(
    arg: ServiceArguments["findCategoryById"]
  ): Promise<Readonly<CategoryPrivateInterface> | null>;
  listCategories(): Promise<Readonly<CategoryPrivateInterface>[]>;
  addCategory(arg: ServiceArguments["addCategory"]): CategoryResponse;
  editCategory(arg: ServiceArguments["editCategory"]): CategoryResponse;
}
