import {
  makeFind,
  makeProductsSortStage,
  makeProductsFilterStage,
  makeProductsProjectStage,
  buildMakeAggregationPipelineToGetProducts,
} from "./find";
import { makeInsert } from "./insert";
import { makeFindByIds } from "./find-by-ids";
import { makeUpdateById } from "./update-by-id";
import { makeDeleteByIds } from "./delete-by-ids";
import { makeSearchProducts } from "./search-products";
import { makeFindSimilarProducts } from "./find-similar-products";
import { makeGetSearchSuggestions } from "./get-search-suggestions";

import {
  makeMainImageUrlGeneratorStage,
  makeAllProductCategoriesLookupStage,
} from "./util";
import {
  makePaginationStagesArray,
  addUseTransactionAndArgsFilter,
} from "../util";

import type { Collection } from "mongodb";
import type { MakeDatabaseType } from "../interface";
import type { ProductDatabase } from "../../use-cases/interfaces/product-db";
import type { ProductPrivateInterface } from "../../entities/product/interface";
import { deepFreeze } from "../../common/util/deep-freeze";

export const makeFindArgsPartial = (() => {
  const commonFormattedProductFields = [
    "_id",
    "name",
    "price",
    "priceUnit",
    "shortDescriptions",
  ];

  return deepFreeze({
    metaFieldName: "meta",
    productsFieldName: "products",
    productCategoriesFieldName: "categories",

    metaFieldNames: {
      allBrands: "brands",
      maxPrice: "maxPrice",
      minPrice: "minPrice",
      productsCount: "count",
    },
    originalProductFieldNames: {
      imageId: "id",
      brand: "brand",
      price: "price",
      images: "images",
      brandId: "brand.id",
      imageUrl: "imageUrl",
      isHidden: "isHidden",
      imageIsMain: "isMain",
      categoryId: "categoryId",
    },

    formattedProductFields: {
      public: [...commonFormattedProductFields],
      private: [...commonFormattedProductFields, "isHidden"],
    },

    formattedProductCategoryFields: ["_id", "name", "parentId"],
  });
})();

export interface MakeProductDatabase_Argument {
  imageUrlPrefix: string;
  productCategoryCollectionName: string;
  collection: Collection<ProductPrivateInterface>;
  productSearchFields: (keyof ProductPrivateInterface)[];
}

export function makeProductDatabase(
  factoryArg: MakeProductDatabase_Argument
): MakeDatabaseType<ProductDatabase> {
  const {
    collection,
    imageUrlPrefix,
    productSearchFields,
    productCategoryCollectionName,
  } = factoryArg;

  const __database__: ProductDatabase = Object.freeze({
    insert: makeInsert({ collection }),
    findByIds: makeFindByIds({ collection }),
    updateById: makeUpdateById({ collection }),
    deleteByIds: makeDeleteByIds({ collection }),

    find: makeFind({
      collection,
      deepFreeze,
      imageUrlPrefix,
      ...makeFindArgsPartial,
      makeAggregationPipelineToGetProducts:
        buildMakeAggregationPipelineToGetProducts({
          makeProductsSortStage,
          makeProductsFilterStage,
          makeProductsProjectStage,
          makeMainImageUrlGeneratorStage,
          makeAllProductCategoriesLookupStage,
          makeProductsPaginationStagesArray: makePaginationStagesArray,
        }),
      productCategoriesCollectionName: productCategoryCollectionName,
    }),

    searchProducts: makeSearchProducts({
      collection,
      deepFreeze,
      imageUrlPrefix,
      productCategoryCollectionName,
      makeMainImageUrlGeneratorStage,
      makeAllProductCategoriesLookupStage,
      searchPaths: productSearchFields as any,
      makeAggregationStagesForPagination: makePaginationStagesArray,
    }),

    getSearchSuggestions: makeGetSearchSuggestions({
      collection,
      deepFreeze,
      imageUrlPrefix,
      makeMainImageUrlGeneratorStage,
    }),

    findSimilarProducts: makeFindSimilarProducts({
      collection,
      deepFreeze,
      imageUrlPrefix,
      makeMainImageUrlGeneratorStage,
      generatedUrlFieldName: "imageUrl",
    }),
  }) as any;

  return addUseTransactionAndArgsFilter<ProductDatabase>(__database__);
}
