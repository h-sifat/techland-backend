import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
}

export interface ProductDatabase {
  findById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductPrivateInterface> | null>;
}
