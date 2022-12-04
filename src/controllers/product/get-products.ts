import type { HttpResponse } from "../interface";
import type { ProductController } from "../interface/product";
import type { FormatDocumentAs } from "../../use-cases/interfaces";
import type { WithTransaction } from "../../data-access/interface";
import type { DBQueryMethodArgs } from "../../use-cases/interfaces/product-db";
import type { ProductService } from "../../use-cases/interfaces/product-service";
import type { ProductCategoryService } from "../../use-cases/interfaces/product-category-service";

import {
  isNever,
  makeZodErrorMap,
  MissingOrUnknownPropertiesInSchema,
} from "../../common/util/zod";
import { z } from "zod";
import { makeDebugger } from "../../common/util/debug";

const debug = makeDebugger({ namespace: "controller" });

export interface MakeGetProducts_Argument {
  ProductService: Pick<
    ProductService,
    | "listProducts"
    | "searchProducts"
    | "findProductByIds"
    | "findSimilarProducts"
    | "getSearchSuggestions"
  >;

  config: {
    MAX_FIND_BY_IDS: number;
    MAX_SIMILAR_PRODUCTS: number;
    MAX_PRODUCTS_PER_PAGE: number;
    MAX_SEARCH_SUGGESTIONS: number;
    MAX_SEARCH_QUERY_LENGTH: number;

    DEFAULT_PRODUCTS_PER_PAGE: number;
    DEFAULT_SIMILAR_PRODUCTS_COUNT: number;
    DEFAULT_SEARCH_SUGGESTIONS_COUNT: number;
  };

  WithTransaction: WithTransaction;
  CategoryService: Pick<ProductCategoryService, "findSubCategories">;
}

export function makeGetProducts(
  factoryArg: MakeGetProducts_Argument
): ProductController["get"] {
  const { config } = factoryArg;

  // ======================= [Validation Schemas] ==================

  const SortOrdersMap = Object.freeze({
    1: "ascending",
    "-1": "descending",
  } as const);

  const ListQuerySchema = z.object({
    brandIds: z.array(z.string().min(1)).default([]),
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
        price: z
          .union([z.literal("1"), z.literal("-1")])
          .transform((order) => SortOrdersMap[order]),
      })
      .default({ price: "1" }),
    pagination: z
      .object({
        pageNumber: z.number().nonnegative().int(),
        itemsPerPage: z
          .number()
          .int()
          .nonnegative()
          .max(config.MAX_PRODUCTS_PER_PAGE),
      })
      .default({
        pageNumber: 1,
        itemsPerPage: config.DEFAULT_PRODUCTS_PER_PAGE,
      }),
  });

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof ListQuerySchema>,
      Omit<DBQueryMethodArgs["find"], "formatDocumentAs" | "categoryIds"> & {
        categoryId: string;
      }
    >;
    isNever<shouldBeNever>();
  }

  const SearchQuerySchema = z
    .object({
      query: z.string().trim().min(1).max(config.MAX_SEARCH_QUERY_LENGTH),
    })
    .merge(ListQuerySchema.pick({ pagination: true }));

  const FindByIdsQuerySchema = z.object({
    ids: z.array(z.string().min(1)).min(1).max(config.MAX_FIND_BY_IDS),
  });

  const SuggestionQuerySchema = z
    .object({
      count: z
        .number()
        .nonnegative()
        .int()
        .max(config.MAX_SEARCH_SUGGESTIONS)
        .default(config.DEFAULT_SEARCH_SUGGESTIONS_COUNT),
    })
    .merge(SearchQuerySchema.pick({ query: true }));

  const SimilarProductsQuerySchema = z.object({
    id: z.string().min(1),
    count: z
      .number()
      .nonnegative()
      .int()
      .max(config.MAX_SIMILAR_PRODUCTS)
      .default(config.DEFAULT_SIMILAR_PRODUCTS_COUNT),
  });

  const errorMap = makeZodErrorMap({ objectName: "Query" });

  const QuerySchema = z.discriminatedUnion("qType", [
    z.object({ qType: z.literal("list") }).merge(ListQuerySchema),
    z.object({ qType: z.literal("search") }).merge(SearchQuerySchema),
    z.object({ qType: z.literal("byIds") }).merge(FindByIdsQuerySchema),
    z.object({ qType: z.literal("suggestions") }).merge(SuggestionQuerySchema),
    z.object({ qType: z.literal("similar") }).merge(SimilarProductsQuerySchema),
  ]);

  // ======================[End Validation Schemas]=========================

  const { ProductService, CategoryService, WithTransaction } = factoryArg;

  return async function getProducts(arg) {
    const { httpRequest } = arg;
    const headers: HttpResponse["headers"] = {
      "Content-Type": "application/json",
    };

    const result = QuerySchema.safeParse(httpRequest.query, { errorMap });
    if (!result.success)
      return {
        headers,
        statusCode: 400,
        body: {
          success: false,
          errorType: "validation",
          error: result.error.flatten(),
        },
      };

    const query = result.data;
    const formatDocumentAs = "public";

    try {
      let result: any;
      switch (query.qType) {
        case "list":
          result = await listProducts({ ...query, formatDocumentAs });
          break;
        case "byIds":
          result = await ProductService.findProductByIds({
            ids: query.ids,
            formatDocumentAs,
          });
          break;
        case "search":
          result = await ProductService.searchProducts({
            formatDocumentAs,
            query: query.query,
            pagination: query.pagination,
          });
          break;
        case "suggestions":
          result = await ProductService.getSearchSuggestions({
            count: query.count,
            query: query.query,
          });
          break;
        case "similar":
          result = await findSimilarProducts({
            id: query.id,
            count: query.count,
          });
      }
      return {
        headers,
        statusCode: 200,
        body: { success: true, data: result },
      };
    } catch (ex) {
      debug(ex);
      // @TODO log error
      return {
        headers,
        statusCode: 500,
        body: {
          success: false,
          errorType: "msgAndCode",
          error: { message: "Internal server error." },
        },
      };
    }
  };

  async function findSimilarProducts(
    arg: z.infer<typeof SimilarProductsQuerySchema>
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        await WithTransaction(async ({ transaction }) => {
          const similarProducts = ProductService.findSimilarProducts(
            { id: arg.id, count: arg.count },
            { transaction }
          );
          resolve(similarProducts);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  async function listProducts(
    arg: z.infer<typeof ListQuerySchema> & FormatDocumentAs
  ) {
    const { categoryId, formatDocumentAs } = arg;

    const findArgPartial = {
      formatDocumentAs,
      sortBy: arg.sortBy,
      brandIds: arg.brandIds,
      pagination: arg.pagination,
      priceRange: arg.priceRange,
    } as const;

    if (!categoryId)
      return await ProductService.listProducts({
        categoryIds: [],
        ...findArgPartial,
      });

    return new Promise(async (resolve, reject) => {
      try {
        await WithTransaction(async ({ transaction }) => {
          const subCategories = await CategoryService.findSubCategories(
            { id: categoryId, formatDocumentAs },
            { transaction }
          );
          const categoryIds = [
            ...new Set(subCategories.map((c) => c._id).concat([categoryId])),
          ];

          const products = await ProductService.listProducts(
            { ...findArgPartial, categoryIds },
            { transaction }
          );

          resolve(products);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }
}
