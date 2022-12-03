import { makeId } from "../../common/util";
import { deepFreeze } from "../../common/util/deep-freeze";
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
  collection: <any>collection,
  makeMainImageUrlGeneratorStage,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  const fakeSimilarProducts = [{ v: "a" }, { v: "b" }];

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

  beforeEach(() => {
    toArray.mockResolvedValueOnce(fakeSimilarProducts);
  });

  it(`calls the aggregate method and returns the result of toArray`, async () => {
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

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), {});
  });

  it(`passes the transaction session to the db method`, async () => {
    const session: any = "my transaction session";

    // @ts-expect-error
    await findSimilarProducts(arg, { session });
    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), { session });
  });
});
