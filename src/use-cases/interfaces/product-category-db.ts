import { CategoryInterface } from "../../entities/product-category/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByHash: { name: string };
  updateById: { id: string; category: CategoryInterface };
}

export interface ProductCategoryDatabase {
  findById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<CategoryInterface> | null>;
  findByHash(
    arg: DBQueryMethodArgs["findByHash"]
  ): Promise<Readonly<CategoryInterface> | null>;
  updateById(
    arg: DBQueryMethodArgs["updateById"]
  ): Promise<Readonly<CategoryInterface>>;
  insert(arg: CategoryInterface): Promise<void>;
  deleteById(arg: DBQueryMethodArgs["deleteById"]): Promise<void>;
}