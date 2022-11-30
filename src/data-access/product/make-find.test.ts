import {
  makeFindProducts,
  makeProductsSortStage,
  makeProductsFilterStage,
  makeProductsProjectStage,
  makeMainImageUrlGeneratorStage,
  makeAllProductCategoriesLookupStage,
  buildMakeAggregationPipelineToGetProducts,
} from "./make-find";
import { z } from "zod";
import { inspect } from "util";
import { makeFindArgsPartial } from ".";
import deepFreezeStrict from "deep-freeze-strict";
import { DBQueryMethodArgs } from "../../use-cases/interfaces/product-db";
import { makePaginationStagesArray } from "../util";

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

const find = makeFindProducts({
  imageUrlPrefix,
  ...makeFindArgsPartial,
  deepFreeze: deepFreezeStrict,
  productCategoriesCollectionName,
  makeAggregationPipelineToGetProducts,
  getCollection: () => collection as any,
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

describe("find: Argument Validation", () => {
  const invalidFindArgDataSet: Record<keyof DBQueryMethodArgs["find"], any[]> =
    deepFreezeStrict({
      categoryId: ["", 12],
      sortBy: [{}, { price: 1 }],
      formatDocumentAs: ["object", ""],
      brandIds: [[], [""], ["a", 1], "abc"],
      priceRange: [{ min: -234 }, { max: -234 }, { min: 200, max: 100 }],
      pagination: [
        {},
        { pageNumber: 1 },
        { itemsPerPage: 1 },
        { itemsPerPage: -14, pageNumber: 2 },
        { itemsPerPage: 14, pageNumber: -2 },
        { itemsPerPage: 14, pageNumber: -2.5 },
        { itemsPerPage: 14.323, pageNumber: 2 },
      ],
    });

  const testSuit = Object.entries(invalidFindArgDataSet)
    .map(([field, invalidValues]) =>
      invalidValues.map((value) => ({
        field,
        value,
        case: `"${field}" is invalid (${inspect(value)})`,
      }))
    )
    .flat();

  it.each(testSuit)(`throws error if $case`, async ({ field, value }) => {
    expect.assertions(2);
    try {
      await find({ ...validFindArg, [field]: value });
    } catch (ex) {
      expect(ex).toBeInstanceOf(z.ZodError);
      expect(ex.flatten()).toEqual({
        formErrors: expect.any(Array),
        fieldErrors: { [field]: expect.any(Array) },
      });
    }
  });
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
        $match: { [originalProductFieldNames.isHidden]: { $eq: false } },
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
        [originalProductFieldNames.isHidden]: { $eq: false },
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

describe("makeMainImageUrlGeneratorStage", () => {
  it(`create a $set stage to create the mainImageUrl`, () => {
    const {
      images: imagesFieldName,
      imageId: imageIdFieldName,
      imageUrl: imageUrlFieldName,
      imageIsMain: imageIsMainFieldName,
    } = originalProductFieldNames;
    const imageUrlPrefix = "https://techland.com/images/";

    const mainImageUrlGeneratorStage = makeMainImageUrlGeneratorStage({
      imageUrlPrefix,
      originalProductFieldNames,
    });

    expect(mainImageUrlGeneratorStage).toEqual({
      $set: {
        [imageUrlFieldName]: {
          // select the main image id and generate url
          $concat: [
            imageUrlPrefix,
            {
              $getField: {
                input: {
                  $first: {
                    $filter: {
                      input: `$${imagesFieldName}`,
                      as: "image",
                      cond: { $eq: [`$$image.${imageIsMainFieldName}`, true] },
                    },
                  }, // end $first
                },
                field: imageIdFieldName,
              }, // end $getField
            },
          ],
        }, // end imageUrl
      },
    });
  });
});

describe("makeAllCategoriesLookupStage", () => {
  it(`makes a $lookup stage from product_categories`, () => {
    const productCategoriesFieldName = "categories";
    const productCategoriesCollectionName = "product_categories";
    const formattedProductCategoryFields = Object.freeze([
      "_id",
      "name",
      "parentId",
    ]) as any;

    const lookupCategoriesStage = makeAllProductCategoriesLookupStage({
      productCategoriesFieldName,
      productCategoriesCollectionName,
      formattedProductCategoryFields,
    });

    expect(lookupCategoriesStage).toEqual({
      $lookup: {
        from: productCategoriesCollectionName,
        as: productCategoriesFieldName,
        pipeline: [
          // this stage generates: {$project: {name: 1, parentId: 1 ...}}
          {
            $project: formattedProductCategoryFields.reduce(
              (projectObject: any, field: any) => {
                projectObject[field] = 1;
                return projectObject;
              },
              {} as any
            ),
          },
        ],
      },
    });
  });
});

describe("makeAggregationPipelineToGetProducts", () => {
  it(`hopefully it creates the long and complex aggregation pipeline`, () => {
    const categoryId = "oh_hi!";
    const brandIds = Object.freeze(["a", "b"]);
    const priceRange = Object.freeze({ min: 1, max: 10 });
    const sortBy = Object.freeze({ price: "descending" });

    const pipeline = makeAggregationPipelineToGetProducts({
      sortBy,
      categoryId,
      priceRange,
      imageUrlPrefix,
      ...validFindArg,
      ...makeFindArgsPartial,
      brandIds: <any>brandIds,
      productCategoriesCollectionName,
    });

    const { originalProductFieldNames } = makeFindArgsPartial;

    expect(pipeline).toEqual([
      { $match: { [originalProductFieldNames.categoryId]: "oh_hi!" } },
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
                [originalProductFieldNames.isHidden]: { $eq: false },
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
  it(`returns the result`, async () => {
    const fakeAggregationResult = deepFreezeStrict([
      {
        products: ["MSI motherboard"],
        categories: ["Components"],
        meta: { count: 100, minPrice: 100, maxPrice: 200, allBrands: ["MSI"] },
      },
    ]);

    toArray.mockResolvedValueOnce(fakeAggregationResult);

    const result = await find({ ...validFindArg });

    expect(result).toEqual({
      products: fakeAggregationResult[0].products,
      categories: fakeAggregationResult[0].categories,
      ...fakeAggregationResult[0].meta,
    });
  });
});
