import {
  makeFind,
  makeProductsSortStage,
  makeProductsFilterStage,
  makeProductsProjectStage,
  buildMakeAggregationPipelineToGetProducts,
} from "./find";

import { makeFindArgsPartial } from ".";
import deepFreezeStrict from "deep-freeze-strict";
import { makePaginationStagesArray } from "../util";
import { DBQueryMethodArgs } from "../../use-cases/interfaces/product-db";
import {
  makeMainImageUrlGeneratorStage,
  makeAllProductCategoriesLookupStage,
} from "./util";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const imageUrlPrefix = "https://techland.com/imgaes";
const productCategoriesCollectionName = "product_categories";

const makeAggregationPipelineToGetProducts =
  buildMakeAggregationPipelineToGetProducts({
    makeProductsSortStage,
    makeProductsFilterStage,
    makeProductsProjectStage,
    makeMainImageUrlGeneratorStage,
    makeAllProductCategoriesLookupStage,
    makeProductsPaginationStagesArray: makePaginationStagesArray,
  });

const find = makeFind({
  imageUrlPrefix,
  ...makeFindArgsPartial,
  deepFreeze: deepFreezeStrict,
  collection: collection as any,
  productCategoriesCollectionName,
  makeAggregationPipelineToGetProducts,
});

const originalProductFieldNames = makeFindArgsPartial.originalProductFieldNames;

const validFindArg: DBQueryMethodArgs["find"] = deepFreezeStrict({
  formatDocumentAs: "public",
  pagination: { pageNumber: 1, itemsPerPage: 20 },
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("makeProductsProjectStage", () => {
  it.each([
    {
      formatDocumentAs: "public",
      formattedProductFields: {
        public: Object.freeze(["a", "b"]),
        private: Object.freeze(["c", "d"]),
      },
      expectedResult: deepFreezeStrict({ $project: { a: 1, b: 1 } }),
    },
    {
      formatDocumentAs: "private",
      formattedProductFields: {
        public: Object.freeze(["a", "b"]),
        private: Object.freeze(["c", "d"]),
      },
      expectedResult: deepFreezeStrict({ $project: { c: 1, d: 1 } }),
    },
  ] as const)(
    `generates the right project object for "$formatDocumentAs" type`,
    ({ formatDocumentAs, formattedProductFields, expectedResult }) => {
      const result = makeProductsProjectStage({
        formatDocumentAs,
        // @ts-ignore
        formattedProductFields,
      });

      expect(result).toEqual(expectedResult);
    }
  );
});

describe("makeProductsSortStage", () => {
  it.each([
    {
      sortBy: undefined,
      expectedResult: deepFreezeStrict({ $sort: { _id: 1 } }),
    },
    {
      sortBy: { price: "ascending", createdAt: "descending" },
      expectedResult: deepFreezeStrict({ $sort: { price: 1, createdAt: -1 } }),
    },
  ])(
    `returns $expectedResult if sortBy is: $sortBy`,
    ({ sortBy, expectedResult }) => {
      // @ts-ignore
      const result = makeProductsSortStage({ sortBy });
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("makeProductsFilterStage", () => {
  it.each([
    {
      arg: { originalProductFieldNames },
      expectedResult: deepFreezeStrict({ $match: {} }),
      case: `with not filters if no filter prop exists`,
    },
    {
      arg: { originalProductFieldNames, priceRange: { min: 10 } },
      expectedResult: deepFreezeStrict({
        $match: { [originalProductFieldNames.price]: { $gte: 10 } },
      }),
      case: `with min price filter if "min" exists in "priceRange"`,
    },
    {
      arg: { originalProductFieldNames, priceRange: { max: 10 } },
      expectedResult: deepFreezeStrict({
        $match: { [originalProductFieldNames.price]: { $lte: 10 } },
      }),
      case: `with max price filter if "max" exists in "priceRange"`,
    },
    {
      arg: { originalProductFieldNames, priceRange: { min: 1, max: 10 } },
      expectedResult: deepFreezeStrict({
        $match: { [originalProductFieldNames.price]: { $gte: 1, $lte: 10 } },
      }),
      case: `with both price filter "min" and "max if they exists"`,
    },
    {
      arg: { originalProductFieldNames, priceRange: { max: undefined } },
      expectedResult: deepFreezeStrict({ $match: {} }),
      case: `with no price filter if "min" and "max does not exists"`,
    },
    {
      arg: { originalProductFieldNames, formatDocumentAs: "public" },
      expectedResult: deepFreezeStrict({
        $match: { [originalProductFieldNames.isHidden]: false },
      }),
      case: `with ${originalProductFieldNames.isHidden} !== false if "formatDocumentAs" is public`,
    },
    {
      arg: { originalProductFieldNames, brandIds: [] },
      expectedResult: deepFreezeStrict({ $match: {} }),
      case: `with no brand filter if brandIds is an empty array`,
    },
    {
      arg: { originalProductFieldNames, brandIds: ["a"] },
      expectedResult: deepFreezeStrict({
        $match: { [originalProductFieldNames.brandId]: { $in: ["a"] } },
      }),
      case: `with brand filter if brandIds is a non empty array`,
    },
  ])(`returns $match stage $case`, ({ arg, expectedResult }) => {
    // @ts-ignore
    const result = makeProductsFilterStage(arg);
    expect(result).toEqual(expectedResult);
  });

  it(`makes products filter $match stage`, () => {
    const brandIds = Object.freeze(["a", "b"]);
    const priceRange = Object.freeze({ min: 1, max: 10 });

    const publicMatchStage = makeProductsFilterStage({
      priceRange,
      brandIds: brandIds as any,
      originalProductFieldNames,
      formatDocumentAs: "public",
    });

    expect(publicMatchStage).toEqual({
      $match: {
        [originalProductFieldNames.price]: {
          $gte: priceRange.min,
          $lte: priceRange.max,
        },
        [originalProductFieldNames.isHidden]: false,
        [originalProductFieldNames.brandId]: { $in: brandIds },
      },
    });

    const privateMatchStage = makeProductsFilterStage({
      priceRange,
      brandIds: brandIds as any,
      originalProductFieldNames,
      formatDocumentAs: "private",
    });
    expect(privateMatchStage).toEqual({
      $match: {
        [originalProductFieldNames.price]: {
          $gte: priceRange.min,
          $lte: priceRange.max,
        },
        [originalProductFieldNames.brandId]: { $in: brandIds },
      },
    });
  });
});

describe("makeAggregationPipelineToGetProducts", () => {
  it(`hopefully it creates the long and complex aggregation pipeline`, () => {
    const categoryIds = ["oh_hi!"];
    const brandIds = Object.freeze(["a", "b"]);
    const priceRange = Object.freeze({ min: 1, max: 10 });
    const sortBy = Object.freeze({ price: "descending" });

    const pipeline = makeAggregationPipelineToGetProducts({
      sortBy,
      priceRange,
      imageUrlPrefix,
      ...validFindArg,
      ...makeFindArgsPartial,
      brandIds: <any>brandIds,
      categoryIds: categoryIds,
      productCategoriesCollectionName,
    });

    const { originalProductFieldNames } = makeFindArgsPartial;

    // @TODO replace the actual pipeline stages with their respective
    // generator functions, so that, changes to any stage doesn't break
    // this test
    expect(pipeline).toEqual([
      {
        $match: {
          [originalProductFieldNames.categoryId]: { $in: categoryIds },
        },
      },
      {
        $facet: {
          products: [
            {
              $match: {
                [originalProductFieldNames.price]: {
                  $gte: priceRange.min,
                  $lte: priceRange.max,
                },
                [originalProductFieldNames.brandId]: { $in: brandIds },
                [originalProductFieldNames.isHidden]: false,
              },
            },
            { $sort: { [originalProductFieldNames.price]: -1 } },
            { $skip: 0 },
            { $limit: 20 },
            {
              $set: {
                imageUrl: {
                  $concat: [
                    imageUrlPrefix,
                    {
                      $getField: {
                        input: {
                          $first: {
                            $filter: {
                              input: "$" + originalProductFieldNames.images,
                              as: "image",
                              cond: {
                                $eq: [
                                  `$$image.${originalProductFieldNames.imageIsMain}`,
                                  true,
                                ],
                              },
                            },
                          },
                        },
                        field: originalProductFieldNames.imageId,
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                priceUnit: 1,
                shortDescriptions: 1,
              },
            },
          ],
          [makeFindArgsPartial.metaFieldName]: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                maxPrice: { $max: "$price" },
                minPrice: { $min: "$price" },
                brands: { $addToSet: "$brand" },
              },
            },
            { $project: { _id: 0 } },
          ],
        },
      },
      { $project: { products: 1, meta: { $first: "$meta" } } },
      {
        $lookup: {
          from: productCategoriesCollectionName,
          as: makeFindArgsPartial.productCategoriesFieldName,
          pipeline: [{ $project: { _id: 1, name: 1, parentId: 1 } }],
        },
      },
    ]);
  });
});

describe("find", () => {
  const fakeAggregationResult = deepFreezeStrict([
    {
      products: ["MSI motherboard"],
      categories: ["Components"],
      meta: { count: 100, minPrice: 100, maxPrice: 200, allBrands: ["MSI"] },
    },
  ]);

  it(`returns the result`, async () => {
    toArray.mockResolvedValueOnce(fakeAggregationResult);

    const result = await find({ ...validFindArg });

    expect(result).toEqual({
      products: fakeAggregationResult[0].products,
      categories: fakeAggregationResult[0].categories,
      ...fakeAggregationResult[0].meta,
    });

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), {});
  });

  it(`passes the transaction session to the db method`, async () => {
    toArray.mockResolvedValueOnce(fakeAggregationResult);

    const session: any = "my transaction session";

    await find({ ...validFindArg }, { session });
    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), { session });
  });
});
