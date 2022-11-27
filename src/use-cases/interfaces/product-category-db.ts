import { CategoryPrivateInterface } from "../../entities/product-category/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByHash: { hash: string };
  updateById: { id: string; category: CategoryPrivateInterface };
}

export interface ProductCategoryDatabase {
  findAll(): Promise<Readonly<CategoryPrivateInterface>[]>;
  findById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<CategoryPrivateInterface> | null>;
  findByHash(
    arg: DBQueryMethodArgs["findByHash"]
  ): Promise<Readonly<CategoryPrivateInterface> | null>;
  updateById(
    arg: DBQueryMethodArgs["updateById"]
  ): Promise<Readonly<CategoryPrivateInterface>>;
  insert(arg: CategoryPrivateInterface): Promise<void>;
  deleteById(arg: DBQueryMethodArgs["deleteById"]): Promise<void>;
}
