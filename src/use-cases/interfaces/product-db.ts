import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByName: { name: string };
  updateById: { id: string; product: ProductPrivateInterface };
}

type ProductResponse = Promise<Readonly<ProductPrivateInterface> | null>;

export interface ProductDatabase {
  insert(arg: ProductPrivateInterface): Promise<void>;
  findById(arg: DBQueryMethodArgs["findById"]): ProductResponse;
  deleteById(arg: DBQueryMethodArgs["deleteById"]): Promise<void>;
  findByName(arg: DBQueryMethodArgs["findByName"]): ProductResponse;

  updateById(
    arg: DBQueryMethodArgs["updateById"]
  ): Promise<Readonly<ProductPrivateInterface>>;
}
