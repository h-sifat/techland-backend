import type { DBQueryMethodArgs } from "./product-db";
import type { ProductPrivateInterface } from "../../entities/product/interface";
import type { MakeProduct_Argument } from "../../entities/product/make-product-entity";

export interface ServiceArguments {
  addProduct: { product: MakeProduct_Argument };
}

export interface ProductService {
  findProductById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductPrivateInterface> | null>;
  addProduct(
    arg: ServiceArguments["addProduct"]
  ): Promise<Readonly<ProductPrivateInterface>>;
}
