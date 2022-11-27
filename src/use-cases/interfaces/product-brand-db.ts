import type { ProductBrandInterface } from "../../entities/product-brand/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByName: { name: string };
  updateById: { id: string; brand: ProductBrandInterface };
}

export interface ProductBrandDatabase {
  insert(brand: ProductBrandInterface): Promise<void>;
  findAll(): Promise<Readonly<ProductBrandInterface>[]>;
  findById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductBrandInterface> | null>;
  findByName(
    arg: DBQueryMethodArgs["findByName"]
  ): Promise<Readonly<ProductBrandInterface> | null>;
  updateById(
    arg: DBQueryMethodArgs["updateById"]
  ): Promise<Readonly<ProductBrandInterface>>;
  insert(arg: ProductBrandInterface): Promise<void>;
  deleteById(arg: DBQueryMethodArgs["deleteById"]): Promise<void>;
}
