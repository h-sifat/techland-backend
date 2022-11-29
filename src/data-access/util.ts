import { z } from "zod";
import {
  isNever,
  MissingOrUnknownPropertiesInSchema,
} from "../common/util/zod";
import deepFreezeStrict from "deep-freeze-strict";

export interface PaginationObject {
  pageNumber: number;
  itemsPerPage: number;
}

export const PaginationSchema = z
  .object({
    pageNumber: z.number().nonnegative().int(),
    itemsPerPage: z.number().nonnegative().int(),
  })
  .strict();

{
  type shouldBeNever = MissingOrUnknownPropertiesInSchema<
    z.infer<typeof PaginationSchema>,
    PaginationObject
  >;
  isNever<shouldBeNever>();
}

export type MakeAggregationStagesForPagination = (
  arg: PaginationObject
) => [{ $skip: number }, { $limit: number }];

export function makePaginationStagesArray(
  arg: PaginationObject
): [{ $skip: number }, { $limit: number }] {
  const { pageNumber, itemsPerPage } = arg;

  return deepFreezeStrict([
    { $skip: (pageNumber - 1) * itemsPerPage },
    { $limit: itemsPerPage },
  ]);
}

export const DocumentFormatSchema = z
  .string()
  .trim()
  .refine(
    (format) => format === "private" || format === "public",
    (format) => ({ message: `Invalid format: "${format}"` })
  );
