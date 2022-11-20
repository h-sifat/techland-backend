import type { DBQueryMethodArgs } from "./product-db";
import type { ProductPrivateInterface } from "../../entities/product/interface";
import type {
  EditProduct_Changes,
  MakeProduct_Argument,
} from "../../entities/product/make-product-entity";

export interface ServiceArguments {
  addProduct: { product: MakeProduct_Argument };
  editProduct: { id: string; changes: EditProduct_Changes };
}

type ProductResponse = Promise<Readonly<ProductPrivateInterface>>;

export interface ProductService {
  findProductById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductPrivateInterface> | null>;
  addProduct(arg: ServiceArguments["addProduct"]): ProductResponse;
  editProduct(arg: ServiceArguments["editProduct"]): ProductResponse;
}
