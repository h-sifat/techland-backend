import deepFreeze from "deep-freeze-strict";
import { makeId } from "../../common/util";
import { makeFindSimilarProducts } from "./find-similar-products";
import { makeMainImageUrlGeneratorStage } from "./util";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const imageUrlPrefix = "https://techland.com/imgaes";
const generatedUrlFieldName = "imageUrl";

const findSimilarProducts = makeFindSimilarProducts({
  deepFreeze,
  imageUrlPrefix,
  generatedUrlFieldName,
  makeMainImageUrlGeneratorStage,
  getCollection: () => <any>collection,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  it(`calls the aggregate method and returns the result of toArray`, async () => {
    const fakeSimilarProducts = [{ v: "a" }, { v: "b" }];
    toArray.mockResolvedValueOnce(fakeSimilarProducts);

    const arg = deepFreeze({
      count: 5,
      product: {
        categoryId: makeId(),
        specifications: {
          "Basic Information": {
            "Switch Color": "Brown",
          },
        },
      },
    });

    // @ts-expect-error
    const similarProducts = await findSimilarProducts(arg);
    expect(similarProducts).toEqual(fakeSimilarProducts);
    expect(Object.isFrozen(similarProducts)).toBeTruthy();

    const aggregationPipeline = (<object[][]>aggregate.mock.calls[0])[0];

    const firstStage = aggregationPipeline[0];
    expect(firstStage).toMatchObject({
      $search: {
        moreLikeThis: {
          like: {
            categoryId: arg.product.categoryId,
            specifications: arg.product.specifications,
          },
        },
      },
    });

    const limitStage = aggregationPipeline.find((stage) => "$limit" in stage);
    expect(limitStage).toBeDefined();
    expect(limitStage).toEqual({ $limit: arg.count });
  });
});
