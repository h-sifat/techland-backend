import { z } from "zod";
import { makeDebugger } from "../../common/util/debug";
import { makeZodErrorMap } from "../../common/util/zod";

import type { HttpResponse } from "../interface";
import type { ProductCategoryController } from "../interface/product-category";
import type { ProductCategoryService } from "../../use-cases/interfaces/product-category-service";

export interface MakeGetCategories_Argument {
  CategoryService: Pick<
    ProductCategoryService,
    "listCategories" | "findCategoryById" | "findSubCategories"
  >;
}

const debug = makeDebugger({ namespace: "controller" });

const QuerySchema = z.discriminatedUnion("lookup", [
  z.object({ lookup: z.literal("all") }),
  z.object({ lookup: z.literal("sub"), id: z.string().min(1) }),
  z.object({ lookup: z.literal("self"), id: z.string().min(1) }),
]);

const errorMap = makeZodErrorMap({ objectName: "Query" });

export function makeGetCategories(
  factoryArg: MakeGetCategories_Argument
): ProductCategoryController["get"] {
  const { CategoryService } = factoryArg;

  const ServiceForLookupType = Object.freeze({
    all: CategoryService.listCategories,
    self: CategoryService.findCategoryById,
    sub: CategoryService.findSubCategories,
  } as const);

  return async function getCategories(arg) {
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

    try {
      // @ts-expect-error Come on!
      const data = await ServiceForLookupType[query.lookup]({
        id: (<any>query).id,
        formatDocumentAs: "public",
      });
      return { headers, statusCode: 200, body: { success: true, data } };
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
}
