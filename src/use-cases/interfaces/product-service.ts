import type {
  EditProduct_Changes,
  MakeProduct_Argument,
} from "../../entities/product/make-product-entity";
import type { UseCaseOptions } from ".";
import type { DBQueryMethodArgs, ProductDatabase } from "./product-db";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface ServiceArguments {
  addProduct: { product: MakeProduct_Argument };
  editProduct: { id: string; changes: EditProduct_Changes };
}

type ProductResponse = Promise<Readonly<ProductPrivateInterface>>;

export interface ProductService {
  listProducts: ProductDatabase["find"];
  findProductByIds: ProductDatabase["findByIds"];
  searchProducts: ProductDatabase["searchProducts"];
  getSearchSuggestions: ProductDatabase["getSearchSuggestions"];
  addProduct(
    arg: ServiceArguments["addProduct"],
    options?: UseCaseOptions
  ): ProductResponse;
  editProduct(
    arg: ServiceArguments["editProduct"],
    options?: UseCaseOptions
  ): ProductResponse;

  deleteProducts(
    arg: DBQueryMethodArgs["deleteByIds"],
    options?: UseCaseOptions
  ): Promise<ProductPrivateInterface[]>;

  findSimilarProducts(
    arg: { id: string; count: number },
    options?: UseCaseOptions
  ): ReturnType<ProductDatabase["findSimilarProducts"]>;
}
