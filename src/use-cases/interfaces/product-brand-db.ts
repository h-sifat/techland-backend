import type { ProductBrandInterface } from "../../entities/product-brand/interface";

export interface DBQueryMethodArgs {
  insert: ProductBrandInterface;
  findById: { id: string };
  deleteById: { id: string };
  findByName: { name: string };
  updateById: { id: string; document: ProductBrandInterface };
}

export interface ProductBrandDatabase {
  insert(arg: DBQueryMethodArgs["insert"]): Promise<void>;
  findAll(): Promise<Readonly<ProductBrandInterface>[]>;
  findById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductBrandInterface> | null>;
  findByName(
    arg: DBQueryMethodArgs["findByName"]
  ): Promise<Readonly<ProductBrandInterface> | null>;
  updateById(arg: DBQueryMethodArgs["updateById"]): Promise<void>;
}
