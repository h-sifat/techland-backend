import type {
  ProductDatabase,
  MinifiedProductCommonFields,
  MinifiedPublicProductInterface,
  MinifiedPrivateProductInterface,
} from "../../use-cases/interfaces/product-db";
import type {
  MakeMainImageUrlGeneratorStage,
  MakeAllProductCategoriesLookupStage,
} from "./util";
import type { Collection } from "mongodb";
import type { MakeAggregationStagesForPagination } from "../util";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface MakeSearchProducts_Argument {
  deepFreeze<T>(o: T): T;
  imageUrlPrefix: string;
  boostSearchScoreBy?: number;
  productCategoryCollectionName: string;
  searchPaths: (keyof ProductPrivateInterface)[];
  makeMainImageUrlGeneratorStage: MakeMainImageUrlGeneratorStage;
  makeAggregationStagesForPagination: MakeAggregationStagesForPagination;
  getCollection(): Pick<Collection<ProductPrivateInterface>, "aggregate">;
  makeAllProductCategoriesLookupStage: MakeAllProductCategoriesLookupStage;
}

export function makeSearchProducts(
  factoryArg: MakeSearchProducts_Argument
): ProductDatabase["searchProducts"] {
  const {
    deepFreeze,
    searchPaths,
    getCollection,
    imageUrlPrefix,
    boostSearchScoreBy = 3,
    productCategoryCollectionName,
    makeMainImageUrlGeneratorStage,
    makeAggregationStagesForPagination,
    makeAllProductCategoriesLookupStage,
  } = factoryArg;

  const generatedUrlName = "imageUrl";
  const mainImageUrlGeneratorStage = makeMainImageUrlGeneratorStage({
    imageUrlPrefix,
    fieldNames: {
      imageId: "id",
      images: "images",
      imageIsMain: "isMain",
      generatedUrl: generatedUrlName,
    },
  });

  const commonProjectFields: Record<keyof MinifiedProductCommonFields, number> =
    deepFreeze({
      _id: 1,
      name: 1,
      price: 1,
      imageUrl: 1,
      priceUnit: 1,
      shortDescriptions: 1,
    } as const);

  const projectStages: {
    public: Record<keyof MinifiedPublicProductInterface, number>;
    private: Record<keyof MinifiedPrivateProductInterface, number>;
  } = deepFreeze({
    public: commonProjectFields,
    private: { ...commonProjectFields, isHidden: 1 },
  } as const);

  const allProductCategoriesLookupStage = makeAllProductCategoriesLookupStage({
    addCategoriesAs: "categories",
    collectionName: productCategoryCollectionName,
    pickFields: Object.freeze(["_id", "name", "parentId"]) as string[],
  });

  return async function searchProducts(arg) {
    const { query, pagination, formatDocumentAs } = arg;

    // @TODO support specifying categoryId and brand
    // while doing full-text search
    const pipeline = [
      {
        $search: {
          text: {
            query,
            path: searchPaths,
            score: { boost: { value: boostSearchScoreBy } },
            fuzzy: { maxEdits: 2, prefixLength: 1 },
          },
        },
      }, // $search
      ...(formatDocumentAs === "public"
        ? [{ $match: { isHidden: false } }]
        : []),
      {
        $facet: {
          products: [
            {
              $project: {
                ...projectStages[formatDocumentAs],
                score: { $meta: "searchScore" },
              },
            },
            { $sort: { score: -1 } },
            ...makeAggregationStagesForPagination(pagination),
            mainImageUrlGeneratorStage,
            { $project: { images: 0 } },
          ],
          meta: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                maxPrice: { $max: `$price` },
                minPrice: { $min: `$price` },
              },
            },
            // remove the _id filed from the "meta[0]" object
            { $project: { _id: 0 } },
          ],
        },
      }, // $facet
      {
        // ROOT.meta = ROOT.meta[0]
        $project: { products: 1, meta: { $first: `$meta` } },
      },
      allProductCategoriesLookupStage,
    ];

    const result = await getCollection().aggregate(pipeline).toArray();
    return deepFreeze(result[0]) as any;
  };
}
