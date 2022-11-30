import type {
  ProductBrand,
  CommonProductFields,
  ProductPrivateInterface,
  ProductPublicInterface,
} from "../../entities/product/interface";
import type { PaginationObject } from "../../data-access/util";
import type { CategoryInterface } from "../../entities/product-category/interface";

export interface DBQueryMethodArgs {
  findByIds: {
    ids: string[];
    formatDocumentAs: "public" | "private";
  };
  deleteByIds: { ids: string[] };
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
  categories: Pick<CategoryInterface, "_id" | "name" | "parentId">;
}

export interface ProductDatabase {
  insert(arg: ProductPrivateInterface): Promise<void>;

  findByIds<Arg extends DBQueryMethodArgs["findByIds"]>(
    arg: Arg
  ): Arg["formatDocumentAs"] extends "public"
    ? Promise<Readonly<ProductPublicInterface>[]>
    : Promise<Readonly<ProductPrivateInterface>[]>;

  deleteByIds(arg: DBQueryMethodArgs["deleteByIds"]): Promise<void>;

  updateById(arg: DBQueryMethodArgs["updateById"]): Promise<void>;

  find<Arg extends DBQueryMethodArgs["find"]>(
    arg: Arg
  ): Arg["formatDocumentAs"] extends "public"
    ? Promise<FindResult<MinifiedPublicProductInterface>>
    : Promise<FindResult<MinifiedPrivateProductInterface>>;
}
