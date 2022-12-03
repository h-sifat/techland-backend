import type {
  ProductDatabase,
  DBQueryMethodArgs,
  SimilarProductsResult,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { MakeMainImageUrlGeneratorStage } from "./util";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface MakeFindSimilarProducts_Argument {
  deepFreeze<T>(o: T): T;
  imageUrlPrefix: string;
  generatedUrlFieldName: string;
  makeMainImageUrlGeneratorStage: MakeMainImageUrlGeneratorStage;
  collection: Pick<Collection<ProductPrivateInterface>, "aggregate">;
}

export function makeFindSimilarProducts(
  factoryArg: MakeFindSimilarProducts_Argument
) {
  const {
    deepFreeze,
    collection,
    imageUrlPrefix,
    generatedUrlFieldName,
    makeMainImageUrlGeneratorStage,
  } = factoryArg;

  const mainImageUrlGeneratorStage = makeMainImageUrlGeneratorStage({
    imageUrlPrefix,
    fieldNames: {
      imageId: "id",
      images: "images",
      imageIsMain: "isMain",
      generatedUrl: generatedUrlFieldName,
    },
  });

  return async function findSimilarProducts(
    arg: DBQueryMethodArgs["findSimilarProducts"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductDatabase["findSimilarProducts"]> {
    const { count, product } = arg;

    const pipeline = [
      {
        $search: {
          moreLikeThis: {
            like: {
              categoryId: product.categoryId,
              specifications: product.specifications,
            },
          },
        },
      },
      { $match: { _id: { $ne: product._id }, isHidden: { $eq: false } } },
      {
        $project: {
          _id: 1,
          name: 1,
          brand: 1,
          price: 1,
          priceUnit: 1,
          score: { $meta: "searchScore" },
        },
      },
      { $sort: { score: -1 } },
      { $limit: count },
      mainImageUrlGeneratorStage,
      { $project: { images: 0 } },
    ];

    const aggregateArgs: [any, any] = [pipeline, options];
    const similarProducts = await collection
      .aggregate(...aggregateArgs)
      .toArray();

    return deepFreeze(similarProducts) as SimilarProductsResult;
  };
}
