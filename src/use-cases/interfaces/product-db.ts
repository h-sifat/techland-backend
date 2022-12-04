import type {
  ProductBrand,
  CommonProductFields,
  ProductPrivateInterface,
  ProductPublicInterface,
} from "../../entities/product/interface";
import type { UseCaseOptions } from ".";
import type { PaginationObject } from "../../data-access/util";
import type { CategoryInterface } from "../../entities/product-category/interface";

interface FormatDocumentAs {
  formatDocumentAs: "public" | "private";
}

interface FindProductArg extends FormatDocumentAs {
  brandIds?: string[];
  categoryIds?: string[];
  pagination: PaginationObject;
  priceRange?: { min?: number; max?: number };
  sortBy?: { price: "ascending" | "descending" };
}

interface SearchProductsArg extends FormatDocumentAs {
  query: string;
  brandId?: string;
  categoryId?: string;
  pagination: PaginationObject;
}

export interface DBQueryMethodArgs {
  insert: ProductPrivateInterface;
  findByIds: {
    ids: string[];
    formatDocumentAs: "public" | "private";
  };
  deleteByIds: { ids: string[] };
  updateById: { id: string; product: ProductPrivateInterface };
  find: FindProductArg;

  searchProducts: SearchProductsArg;
  getSearchSuggestions: Pick<
    SearchProductsArg,
    "categoryId" | "brandId" | "query"
  > & { count: number };
  findSimilarProducts: { product: ProductPrivateInterface; count: number };
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
  Format extends FormatDocumentAs,
  PublicDoc = MinifiedPublicProductInterface,
  PrivateDoc = MinifiedPrivateProductInterface
> {
  count: number;
  maxPrice: number;
  minPrice: number;
  brands: ProductBrand[];
  products: Format["formatDocumentAs"] extends "public"
    ? PublicDoc
    : PrivateDoc;
  categories: Pick<CategoryInterface, "_id" | "name" | "parentId">;
}

export type SimilarProductsResult = (Pick<
  ProductPublicInterface,
  "_id" | "name" | "brand" | "price" | "priceUnit"
> & { imageUrl: string; score: number })[];

export type GetSearchSuggestionsResult = (Pick<
  MinifiedPublicProductInterface,
  "_id" | "name" | "imageUrl"
> & { score: number })[];

export interface ProductDatabase {
  insert(arg: DBQueryMethodArgs["insert"]): Promise<void>;

  findByIds<Arg extends DBQueryMethodArgs["findByIds"]>(
    arg: Arg,
    // @TODO remove this options later. it belongs to the Service
    options?: UseCaseOptions
  ): Arg["formatDocumentAs"] extends "public"
    ? Promise<Readonly<ProductPublicInterface>[]>
    : Promise<Readonly<ProductPrivateInterface>[]>;

  deleteByIds(arg: DBQueryMethodArgs["deleteByIds"]): Promise<void>;

  updateById(arg: DBQueryMethodArgs["updateById"]): Promise<void>;

  find<Arg extends DBQueryMethodArgs["find"]>(
    arg: Arg,
    // @TODO remove this options later. it belongs to the Service
    options?: UseCaseOptions
  ): Promise<FindResult<Arg>>;
  searchProducts<Arg extends DBQueryMethodArgs["searchProducts"]>(
    arg: Arg,
    // @TODO remove this options later. it belongs to the Service
    options?: UseCaseOptions
  ): Promise<
    Omit<
      FindResult<
        Arg,
        MinifiedPublicProductInterface & { score: number },
        MinifiedPrivateProductInterface & { score: number }
      >,
      "brands"
    >
  >;

  getSearchSuggestions(
    arg: DBQueryMethodArgs["getSearchSuggestions"],
    // @TODO remove this options later. it belongs to the Service
    options?: UseCaseOptions
  ): Promise<GetSearchSuggestionsResult>;

  findSimilarProducts(
    arg: DBQueryMethodArgs["findSimilarProducts"]
  ): Promise<SimilarProductsResult>;
}
