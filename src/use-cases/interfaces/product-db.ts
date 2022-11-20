import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  findByName: { name: string };
}

type ProductResponse = Promise<Readonly<ProductPrivateInterface> | null>;

export interface ProductDatabase {
  insert(arg: ProductPrivateInterface): Promise<void>;
  findById(arg: DBQueryMethodArgs["findById"]): ProductResponse;
  findByName(arg: DBQueryMethodArgs["findByName"]): ProductResponse;
}
