import type {
  ProductDatabase,
  GetSearchSuggestionsResult,
  DBQueryMethodArgs,
} from "../../use-cases/interfaces/product-db";
import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { MakeMainImageUrlGeneratorStage } from "./util";
import type { ProductPrivateInterface } from "../../entities/product/interface";

export interface MakeGetSearchSuggestions_Argument {
  deepFreeze<T>(o: T): T;
  imageUrlPrefix: string;
  boostSearchScoreBy?: number;
  makeMainImageUrlGeneratorStage: MakeMainImageUrlGeneratorStage;
  collection: Pick<Collection<ProductPrivateInterface>, "aggregate">;
}
export function makeGetSearchSuggestions(
  factoryArg: MakeGetSearchSuggestions_Argument
) {
  const {
    deepFreeze,
    collection,
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

  return async function getSearchSuggestions(
    arg: DBQueryMethodArgs["getSearchSuggestions"],
    options: QueryMethodOptions = {}
  ): ReturnType<ProductDatabase["getSearchSuggestions"]> {
    const { query, count } = arg;

    const pipeline = [
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
    ];

    const aggregateArgs: [any, any] = [pipeline, options];
    const suggestions = await collection.aggregate(...aggregateArgs).toArray();

    return deepFreeze(suggestions) as GetSearchSuggestionsResult;
  };
}
