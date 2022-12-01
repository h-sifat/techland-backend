import type {
  ProductDatabase,
  GetSearchSuggestionsResult,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { MakeMainImageUrlGeneratorStage } from "./util";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface MakeGetSearchSuggestions_Argument {
  deepFreeze<T>(o: T): T;
  imageUrlPrefix: string;
  boostSearchScoreBy?: number;
  makeMainImageUrlGeneratorStage: MakeMainImageUrlGeneratorStage;
  getCollection(): Pick<Collection<ProductPrivateInterface>, "aggregate">;
}
export function makeGetSearchSuggestions(
  factoryArg: MakeGetSearchSuggestions_Argument
): ProductDatabase["getSearchSuggestions"] {
  const {
    deepFreeze,
    getCollection,
    imageUrlPrefix,
    boostSearchScoreBy = 3,
    makeMainImageUrlGeneratorStage,
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

  return async function getSearchSuggestions(arg) {
    const { query, count } = arg;

    const suggestions = await getCollection()
      .aggregate([
        {
          $search: {
            autocomplete: {
              query,
              path: "name",
              fuzzy: { maxEdits: 1, prefixLength: 1 },
              score: { boost: { value: boostSearchScoreBy } },
            },
          },
        },
        { $match: { isHidden: { $eq: false } } },
        {
          $project: {
            _id: 1,
            name: 1,
            images: 1,
            score: { $meta: "searchScore" },
          },
        },
        { $sort: { score: -1 } },
        { $limit: count },
        mainImageUrlGeneratorStage,
        { $project: { images: 0 } },
      ])
      .toArray();

    return deepFreeze(suggestions) as GetSearchSuggestionsResult;
  };
}
