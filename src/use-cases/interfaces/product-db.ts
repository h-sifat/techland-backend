import type {
  ProductBrand,
  CommonProductFields,
  ProductPrivateInterface,
} from "../../entities/product/interface";
import type { CategoryPrivateInterface } from "../../entities/product-category/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByName: { name: string };
  updateById: { id: string; product: ProductPrivateInterface };
  find: {
    brandIds?: string[];
    categoryId?: string | null;
    priceRange?: { min?: number; max?: number };
    sortBy?: { price?: "ascending" | "descending" };
    pagination: { pageNumber: number; itemsPerPage: number };
  };
}

export interface FindOptions {
  audience: "public" | "private";
}

export type MinifiedProductCommonFields = Pick<
  CommonProductFields,
  "_id" | "name" | "price" | "priceUnit" | "shortDescriptions"
> & { imageUrl: string };

export type MinifiedPublicProductInterface = MinifiedProductCommonFields & {
  inStock: boolean;
};

export type MinifiedPrivateProductInterface = MinifiedProductCommonFields & {
  inStock: number;
  isHidden: boolean;
};

export interface FindResult<
  DocumentType extends
    | MinifiedPublicProductInterface
    | MinifiedPrivateProductInterface
> {
  count: number;
  maxPrice: number;
  minPrice: number;
  brands: ProductBrand[];
  products: DocumentType[];
  categories: Pick<CategoryPrivateInterface, "_id" | "name" | "parentId">;
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

  find<Options extends FindOptions>(
    arg: DBQueryMethodArgs["find"],
    options: Options
  ): Options["audience"] extends "public"
    ? Promise<FindResult<MinifiedPublicProductInterface>>
    : Promise<FindResult<MinifiedPrivateProductInterface>>;
}
