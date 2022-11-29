import type {
  ProductBrand,
  CommonProductFields,
  ProductPrivateInterface,
} from "../../entities/product/interface";
import type { PaginationObject } from "../../data-access/util";
import type { CategoryPrivateInterface } from "../../entities/product-category/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByName: { name: string };
  updateById: { id: string; product: ProductPrivateInterface };
  find: {
    brandIds?: string[];
    categoryId?: string | null;
    pagination: PaginationObject;
    formatDocumentAs: "public" | "private";
    priceRange?: { min?: number; max?: number };
    sortBy?: { price: "ascending" | "descending" };
  };
}

export type MinifiedProductCommonFields = Pick<
  CommonProductFields,
  "_id" | "name" | "price" | "priceUnit" | "shortDescriptions"
> & { imageUrl: string };

export type MinifiedPublicProductInterface = MinifiedProductCommonFields;
export type MinifiedPrivateProductInterface = MinifiedProductCommonFields & {
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

  find<Arg extends DBQueryMethodArgs["find"]>(
    arg: Arg
  ): Arg["formatDocumentAs"] extends "public"
    ? Promise<FindResult<MinifiedPublicProductInterface>>
    : Promise<FindResult<MinifiedPrivateProductInterface>>;
}
