import type {
  EditProduct_Changes,
  MakeProduct_Argument,
} from "../../entities/product/make-product-entity";
import type { DBQueryMethodArgs, ProductDatabase } from "./product-db";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface ServiceArguments {
  removeProduct: { id: string };
  addProduct: { product: MakeProduct_Argument };
  editProduct: { id: string; changes: EditProduct_Changes };
}

type ProductResponse = Promise<Readonly<ProductPrivateInterface>>;

export interface ProductService {
  findProductById(
    arg: DBQueryMethodArgs["findById"]
  ): Promise<Readonly<ProductPrivateInterface> | null>;
  listProducts: ProductDatabase["find"];
  addProduct(arg: ServiceArguments["addProduct"]): ProductResponse;
  editProduct(arg: ServiceArguments["editProduct"]): ProductResponse;
  removeProduct(arg: ServiceArguments["removeProduct"]): ProductResponse;
}
