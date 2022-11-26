import { z } from "zod";
import {
  isNever,
  makeZodErrorMap,
  MissingOrUnknownPropertiesInSchema,
} from "../../common/util/zod";

import type { MakeId } from "../../common/interface";
import type { CategoryInterface } from "./interface";

export type MakeCategory_Argument = Pick<CategoryInterface, "name"> &
  Partial<Pick<CategoryInterface, "parentId" | "description" | "imageId">>;

export type EditCategory_Argument = {
  category: CategoryInterface;
  changes: Partial<
    Pick<
      CategoryInterface,
      "name" | "parentId" | "description" | "isDeleted" | "imageId"
    >
  >;
};

export interface MakeCategoryEntity_Argument {
  makeId: MakeId;
  currentTimeMs(): number;
  createHash(str: string): string;
}

export interface CategoryEntity {
  make(arg: MakeCategory_Argument): Readonly<CategoryInterface>;
  edit(arg: EditCategory_Argument): Readonly<CategoryInterface>;
  validate(category: unknown): asserts category is CategoryInterface;
}

export function makeProductCategoryEntity(
  factoryArg: MakeCategoryEntity_Argument
): CategoryEntity {
  const { makeId, currentTimeMs, createHash } = factoryArg;

  // =================[Validation Schemas]=========================
  const CategorySchema = z
    .object({
      _id: z.string().min(1),
      isDeleted: z.boolean(),
      hash: z.string().min(1),
      name: z.string().trim().min(1),
      createdAt: z.number().positive().int(),
      parentId: z.string().min(1).nullable(),
      imageId: z.string().trim().min(1).nullable(),
      description: z.string().trim().min(1).nullable(),
    })
    .strict()
    .superRefine((category, ctx) => {
      const generatedHash = calculateCategoryHash(category);
      if (category.hash !== generatedHash)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid category: hash does not match.`,
        });
    });
  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof CategorySchema>,
      CategoryInterface
    >;
    isNever<shouldBeNever>();
  }

  const MakeCategoryArgumentSchema = z
    .object({
      name: z.string().trim().min(1),
      parentId: z.string().min(1).nullable().default(null),
      imageId: z.string().trim().min(1).nullable().default(null),
      description: z.string().trim().min(1).nullable().default(null),
    })
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof MakeCategoryArgumentSchema>,
      MakeCategory_Argument
    >;
    isNever<shouldBeNever>();
  }

  const EditCategoryChangesSchema = MakeCategoryArgumentSchema.partial()
    .merge(z.object({ isDeleted: z.boolean() }).partial().strict())
    .partial()
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof EditCategoryChangesSchema>,
      EditCategory_Argument["changes"]
    >;
    isNever<shouldBeNever>();
  }

  const errorMap = makeZodErrorMap({ objectName: "Category" });
  // =================[End Validation Schemas]====================

  function make(arg: MakeCategory_Argument): Readonly<CategoryInterface> {
    const categoryArg = MakeCategoryArgumentSchema.parse(arg, { errorMap });

    const category: Readonly<CategoryInterface> = Object.freeze({
      ...categoryArg,
      _id: makeId(),
      isDeleted: false,
      createdAt: currentTimeMs(),
      hash: calculateCategoryHash(categoryArg),
    });

    return category;
  }

  function edit(arg: EditCategory_Argument): Readonly<CategoryInterface> {
    const changes = EditCategoryChangesSchema.parse(arg.changes, { errorMap });

    const editedCategory: CategoryInterface = { ...arg.category, ...changes };
    editedCategory.hash = calculateCategoryHash(editedCategory);

    return Object.freeze(editedCategory);
  }

  function validate(category: unknown): asserts category is CategoryInterface {
    CategorySchema.parse(category, { errorMap });
  }

  function calculateCategoryHash(
    category: Pick<CategoryInterface, "name" | "parentId">
  ) {
    const string = category.name.toLowerCase() + String(category.parentId);
    return createHash(string);
  }

  return Object.freeze({ make, edit, validate });
}
