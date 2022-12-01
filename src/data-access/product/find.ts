import {
  PaginationSchema,
  DocumentFormatSchema,
  MakeAggregationStagesForPagination,
} from "../util";
import { z } from "zod";
import { isNever, makeZodErrorMap } from "../../common/util/zod";

import type {
  MakeMainImageUrlGeneratorStage,
  MakeAllProductCategoriesLookupStage,
} from "./util";
import type { Collection } from "mongodb";
import type { ProductDatabase } from "../../use-cases/interfaces/product-db";
import type { DBQueryMethodArgs } from "../../use-cases/interfaces/product-db";
import type { MissingOrUnknownPropertiesInSchema } from "../../common/util/zod";
import type { ProductPrivateInterface } from "../../entities/product/interface";

// =====================[Validation Schema]=======================

// @TODO move this validation logic to the controller-layer
export const FindProductArgumentSchema = z
  .object({
    brandIds: z.array(z.string().min(1)).min(1).optional(),
    categoryId: z.string().min(1).optional(),

    priceRange: z
      .object({
        min: z.number().positive().optional(),
        max: z.number().positive().optional(),
      })
      .strict()
      .refine(({ min = -Infinity, max = Infinity }) => min <= max, {
        message: `Price Range: "min" must be less than "max".`,
      })
      .optional(),

    sortBy: z
      .object({
        price: z.string().refine(
          (order) => order === "ascending" || order === "descending",
          (order) => ({ message: `Invalid sort order: "${order}"` })
        ),
      })
      .strict()
      .default({ price: "ascending" }),

    pagination: PaginationSchema,
    formatDocumentAs: DocumentFormatSchema,
  })
  .strict();

{
  type shouldBeNever = MissingOrUnknownPropertiesInSchema<
    z.infer<typeof FindProductArgumentSchema>,
    DBQueryMethodArgs["find"]
  >;
  isNever<shouldBeNever>();
}

const errorMap = makeZodErrorMap({ objectName: "findProductsArgument" });
// ===============[End of Validation Schema]==================

// @TODO: fix poor variable naming
export interface MakeFind_Argument {
  deepFreeze<T>(o: T): T;
  getCollection(): Pick<Collection<ProductPrivateInterface>, "aggregate">;

  imageUrlPrefix: string;
  metaFieldNames: {
    maxPrice: string;
    minPrice: string;
    allBrands: string;
    productsCount: string;
  };
  originalProductFieldNames: {
    brand: string;
    price: string;
    images: string;
    brandId: string;
    imageId: string;
    imageUrl: string;
    isHidden: string;
    categoryId: string;
    imageIsMain: string;
  };
  formattedProductFields: {
    public: string[];
    private: string[];
  };
  metaFieldName: string;
  productsFieldName: string;
  productCategoriesFieldName: string;
  productCategoriesCollectionName: string;
  formattedProductCategoryFields: string[];

  makeAggregationPipelineToGetProducts(
    arg: MakeAggregationPipeline_Argument
  ): object[];
}
export function makeFindProducts(
  factoryArg: MakeFind_Argument
): ProductDatabase["find"] {
  const {
    deepFreeze,
    getCollection,

    metaFieldName,
    imageUrlPrefix,
    productsFieldName,
    productCategoriesFieldName,
    productCategoriesCollectionName,

    metaFieldNames,
    formattedProductFields,
    originalProductFieldNames,
    formattedProductCategoryFields,

    makeAggregationPipelineToGetProducts,
  } = factoryArg;

  return async function find(unValidatedArg) {
    const findArg = FindProductArgumentSchema.parse(unValidatedArg, {
      errorMap,
    }) as DBQueryMethodArgs["find"];

    const aggregationPipeline = makeAggregationPipelineToGetProducts({
      ...findArg,
      metaFieldName,
      imageUrlPrefix,
      metaFieldNames,
      productsFieldName,
      formattedProductFields,
      originalProductFieldNames,
      productCategoriesFieldName,
      formattedProductCategoryFields,
      productCategoriesCollectionName,
    });

    const resultArray = await getCollection()
      .aggregate(aggregationPipeline)
      .toArray();

    /**
     * Example structure, but the field names may be different.
     *
     * {
     *  products: object[];
     *  categories: object[]
     *  meta: {count: number; minPrice: number; maxPrice: number; allBrands: object[] }
     * }
     */
    const aggregatedResult = resultArray[0];

    return deepFreeze({
      ...aggregatedResult[metaFieldName],
      [productCategoriesFieldName]:
        aggregatedResult[productCategoriesFieldName],
      [productsFieldName]: aggregatedResult[productsFieldName],
    });
  };
}

export type MakeAggregationPipeline_Argument = DBQueryMethodArgs["find"] &
  Pick<
    MakeFind_Argument,
    | "metaFieldName"
    | "imageUrlPrefix"
    | "metaFieldNames"
    | "productsFieldName"
    | "formattedProductFields"
    | "originalProductFieldNames"
    | "productCategoriesFieldName"
    | "formattedProductCategoryFields"
    | "productCategoriesCollectionName"
  >;

export interface BuildMakeAggregationPipelineToGetProducts_Argument {
  makeMainImageUrlGeneratorStage: MakeMainImageUrlGeneratorStage;
  makeProductsSortStage(arg: MakeProductsSortStage_Argument): object;
  makeProductsPaginationStagesArray: MakeAggregationStagesForPagination;
  makeProductsFilterStage(arg: MakeProductsFilterStage_Argument): object;
  makeAllProductCategoriesLookupStage: MakeAllProductCategoriesLookupStage;
  makeProductsProjectStage(arg: MakeProductsProjectStage_Argument): object;
}

export function buildMakeAggregationPipelineToGetProducts(
  factoryArg: BuildMakeAggregationPipelineToGetProducts_Argument
) {
  const {
    makeProductsSortStage,
    makeProductsFilterStage,
    makeProductsProjectStage,
    makeMainImageUrlGeneratorStage,
    makeProductsPaginationStagesArray,
    makeAllProductCategoriesLookupStage,
  } = factoryArg;

  /**
   * I know this function is long. Please see the commented code
   * at the end of the module to understand what this function is building.
   *
   * O Allah, who is going to test this function 😨?
   * */
  return function makeAggregationPipelineToGetProducts(
    arg: MakeAggregationPipeline_Argument
  ) {
    // filters products by price range, brands etc.
    const productsFilterStage = makeProductsFilterStage(arg);

    // sorts products by price and other fields if provided
    const productsSortStage = makeProductsSortStage(arg);

    // selects the main image and add a `imageUrlFieldName` field in
    // each product document
    const mainImageUrlGeneratorStage = makeMainImageUrlGeneratorStage({
      imageUrlPrefix: arg.imageUrlPrefix,
      fieldNames: {
        ...arg.originalProductFieldNames,
        generatedUrl: arg.originalProductFieldNames.imageUrl,
      },
    });

    // Reshapes product documents based on `formatDocumentAs` option
    const productsProjectStage = makeProductsProjectStage(arg);

    // retrieves all product categories
    const categoriesLookupStage = makeAllProductCategoriesLookupStage({
      collectionName: arg.productCategoriesCollectionName,
      addCategoriesAs: arg.productCategoriesFieldName,
      pickFields: arg.formattedProductCategoryFields,
    });

    // paginates products
    const productsPaginationStagesArray = makeProductsPaginationStagesArray(
      arg.pagination
    );

    // ==============[Building the Pipeline]=======================
    const pipeline: any[] = arg.categoryId
      ? // filter by specific category if categoryId is present
        [
          {
            $match: {
              [arg.originalProductFieldNames.categoryId]: arg.categoryId,
            },
          },
        ]
      : [];

    const { price: priceFieldName, brand: brandFieldName } =
      arg.originalProductFieldNames;

    const facetStage: Record<string, any[]> = {
      // @WARNING The order of the stages should not be changed
      [arg.productsFieldName]: [
        productsFilterStage,
        productsSortStage,
        ...productsPaginationStagesArray,
        mainImageUrlGeneratorStage,
        productsProjectStage,
      ],
      // gather meta information from the documents
      [arg.metaFieldName]: [
        {
          $group: {
            _id: null,
            [arg.metaFieldNames.productsCount]: { $sum: 1 },
            [arg.metaFieldNames.maxPrice]: { $max: `$${priceFieldName}` },
            [arg.metaFieldNames.minPrice]: { $min: `$${priceFieldName}` },
            [arg.metaFieldNames.allBrands]: { $addToSet: `$${brandFieldName}` },
          },
        },
        // remove the _id filed from the "meta[0]" object
        { $project: { _id: 0 } },
      ],
    };

    pipeline.push(
      { $facet: facetStage },
      {
        // ROOT.meta = ROOT.meta[0]
        $project: { products: 1, meta: { $first: `$${arg.metaFieldName}` } },
      },
      categoriesLookupStage
    );

    return pipeline;
  };
}

export type MakeProductsFilterStage_Argument = Pick<
  MakeAggregationPipeline_Argument,
  "priceRange" | "brandIds" | "originalProductFieldNames" | "formatDocumentAs"
>;

export function makeProductsFilterStage(arg: MakeProductsFilterStage_Argument) {
  const filter: any = {};
  {
    // filter by price range if present
    const { priceRange } = arg;
    if (priceRange && (priceRange?.min || priceRange?.max)) {
      const { min, max } = priceRange;
      const { price: priceFieldName } = arg.originalProductFieldNames;

      filter.price = {};
      if (min) filter[priceFieldName]["$gte"] = min;
      if (max) filter[priceFieldName]["$lte"] = max;
    }
  }

  {
    // filter by brandIds
    const { brandIds } = arg;
    const { brandId: brandIdFieldName } = arg.originalProductFieldNames;
    if (brandIds && brandIds.length)
      filter[brandIdFieldName] = { $in: brandIds };
  }

  // don't show hidden products to the public
  if (arg.formatDocumentAs === "public") {
    const { isHidden: isHiddenFiledName } = arg.originalProductFieldNames;
    filter[isHiddenFiledName] = { $eq: false };
  }

  return { $match: filter };
}

export type MakeProductsSortStage_Argument = Pick<
  MakeAggregationPipeline_Argument,
  "sortBy"
>;

export function makeProductsSortStage(arg: MakeProductsSortStage_Argument) {
  const sortObject: Record<string, 1 | -1> = {};

  if (arg.sortBy) {
    for (const [field, order] of Object.entries(arg.sortBy))
      sortObject[field] = order === "ascending" ? 1 : -1;
  } else {
    // as there is no fields in the sortStage
    // we're adding the _id field so that we don't get an error because the
    // sort stage is empty
    sortObject._id = 1;
  }

  return { $sort: sortObject };
}

export type MakeProductsProjectStage_Argument = Pick<
  MakeAggregationPipeline_Argument,
  "formatDocumentAs" | "formattedProductFields"
>;
export function makeProductsProjectStage(
  arg: MakeProductsProjectStage_Argument
) {
  const projectObject: Record<string, number> = {};
  for (const field of arg.formattedProductFields[arg.formatDocumentAs])
    projectObject[field] = 1;

  return { $project: projectObject };
}

/* Example findProducts aggregation pipeline
const pipeline = [
  { $match: { categoryId: "claro3c2300028apj9u0160ua" } }, // optional, if categoryId is defined
  {
    $facet: {
      products: [
        {
          $match: {
            price: { gte: 30, lte: 130 },
            "brand.id": { $in: ["brand_id_1", "brand_id_2"] },
          },
        },
        { $sort: { price: 1 } }, // sort: price ascending | descending
        { $skip: 5 }, // skip: (pageNumber - 1) * itemsPerPage
        { $limit: 5 }, // limit: itemsPerPage
        {
          $set: {
            imageUrl: {
              // select the main image id and generate url
              $concat: [
                "https://techland.com/images/",
                {
                  $getField: {
                    input: {
                      $first: {
                        $filter: {
                          input: "$images",
                          as: "image",
                          cond: { $eq: ["$$image.isMain", true] },
                        },
                      }, // end $first
                    },
                    field: "id",
                  }, // end $getField
                },
              ],
            }, // end imageUrl
          },
        },
        {
          $project: {
            name: 1,
            price: 1,
            imageUrl: 1,
            priceUnit: 1,
            shortDescriptions: 1,
          },
        },
      ],
      meta: [
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
  {
    $project: { products: 1, meta: { $first: "$meta" } },
  },
  {
    $lookup: {
      from: "product_categories",
      as: "categories",
      pipeline: [{ $project: { name: 1, parentId: 1 } }],
    },
  },
]; */
