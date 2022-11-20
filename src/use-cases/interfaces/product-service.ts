import type { DBQueryMethodArgs } from "./product-db";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface ProductService {
  findProductById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductPrivateInterface> | null>;
}
