import type {
  ProductDatabase,
  SimilarProductsResult,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { MakeMainImageUrlGeneratorStage } from "./util";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface MakeFindSimilarProducts_Argument {
  deepFreeze<T>(o: T): T;
  imageUrlPrefix: string;
  generatedUrlFieldName: string;
  makeMainImageUrlGeneratorStage: MakeMainImageUrlGeneratorStage;
  getCollection(): Pick<Collection<ProductPrivateInterface>, "aggregate">;
}

export function makeFindSimilarProducts(
  factoryArg: MakeFindSimilarProducts_Argument
): ProductDatabase["findSimilarProducts"] {
  const {
    deepFreeze,
    getCollection,
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

  return async function findSimilarProducts(arg) {
    const { count, product } = arg;

    const similarProducts = await getCollection()
      .aggregate([
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
      ])
      .toArray();

    return deepFreeze(similarProducts) as SimilarProductsResult;
  };
}
