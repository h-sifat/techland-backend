import { z } from "zod";
import {
  isNever,
  makeZodErrorMap,
  MissingOrUnknownPropertiesInSchema,
} from "../../common/util/zod";

import {
  PRICE_UNITS,
  ProductImage,
  ProductPrivateInterface,
} from "./interface";
import type { MakeId } from "../../common/interface";

export type MakeProduct_Argument = Pick<
  ProductPrivateInterface,
  | "name"
  | "brand"
  | "price"
  | "images"
  | "addedBy"
  | "inStock"
  | "priceUnit"
  | "description"
  | "specifications"
  | "shortDescriptions"
>;

export type EditProduct_Changes = Partial<
  MakeProduct_Argument & Pick<ProductPrivateInterface, "isHidden">
>;

export interface EditProduct_Argument {
  changes: EditProduct_Changes;
  product: ProductPrivateInterface;
}

export interface ProductEntity {
  make(arg: MakeProduct_Argument): Readonly<ProductPrivateInterface>;
  edit(arg: EditProduct_Argument): Readonly<ProductPrivateInterface>;
  validate(product: unknown): asserts product is ProductPrivateInterface;
}

export interface MakeProductEntity_Argument {
  makeId: MakeId;
  deepFreeze<T>(o: T): T;
  currentTimeMs(): number;
  sanitizeHTML(html: string): string;
}

export function makeProductEntity(
  factoryArg: MakeProductEntity_Argument
): ProductEntity {
  const { makeId, sanitizeHTML, currentTimeMs, deepFreeze } = factoryArg;

  // ==================[Validation Schemas]=======================
  const ProductImageSchema = z
    .object({
      id: z.string().trim().min(1),
      isMain: z.boolean().default(false),
    })
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof ProductImageSchema>,
      ProductImage
    >;
    isNever<shouldBeNever>();
  }

  const SpecificationSchema = z.record(z.string().trim().min(1));

  const MakeProductArgumentSchema = z
    .object({
      price: z.number().positive(),
      name: z.string().trim().min(1),
      brand: z.string().trim().min(1),
      addedBy: z.string().trim().min(1),
      inStock: z.number().positive().int(),
      priceUnit: z.nativeEnum(PRICE_UNITS),
      specifications: z.record(SpecificationSchema),
      shortDescriptions: z.array(z.string().trim().min(1)).min(1),

      description: z
        .string()
        .trim()
        .min(1)
        .transform((html) => sanitizeHTML(html).trim()),

      images: z.array(ProductImageSchema).superRefine((images, ctx) => {
        const errorMessage = validateImages(images);
        if (errorMessage)
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: errorMessage });
      }),
    })
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof MakeProductArgumentSchema>,
      MakeProduct_Argument
    >;
    isNever<shouldBeNever>();
  }

  const EditProduct_ChangesSchema = z
    .object({
      isHidden: z.boolean(),
    })
    .strict()
    .merge(MakeProductArgumentSchema.partial())
    .partial();
  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof EditProduct_ChangesSchema>,
      EditProduct_Changes
    >;
    isNever<shouldBeNever>();
  }

  const ProductSchema = MakeProductArgumentSchema.extend({
    _id: z.string().min(1),
    isHidden: z.boolean(),

    // we're overwriting the "description" field because we
    // don't want to sanitize it while validating
    description: z.string().trim().min(1),

    createdAt: z.number().positive().int(),
  });

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof ProductSchema>,
      ProductPrivateInterface
    >;
    isNever<shouldBeNever>();
  }

  const errorMap = makeZodErrorMap({ objectName: "Product" });

  // ==================[End ofValidation Schemas]===================

  function make(arg: MakeProduct_Argument): Readonly<ProductPrivateInterface> {
    const productData = (() => {
      const result = MakeProductArgumentSchema.safeParse(arg, { errorMap });
      if (!result.success) throw result.error;
      return result.data;
    })();

    const product: Readonly<ProductPrivateInterface> = deepFreeze({
      ...productData,
      _id: makeId(),
      isHidden: false,
      createdAt: currentTimeMs(),
    });

    return product;
  }

  function edit(arg: EditProduct_Argument): Readonly<ProductPrivateInterface> {
    const { product, changes: unValidatedChanges } = arg;

    const changes = (() => {
      const result = EditProduct_ChangesSchema.safeParse(unValidatedChanges, {
        errorMap,
      });
      if (!result.success) throw result.error;
      return result.data;
    })();

    const editedProduct = { ...product, ...changes };

    return deepFreeze(editedProduct);
  }

  function validateImages(images: ProductImage[]): string | void {
    const mainImage = images.filter((image) => image.isMain);
    if (!mainImage.length) return "No main image found.";

    if (mainImage.length > 1)
      return "Only one image can be selected as the main image.";

    {
      const uniqueImageIds = new Set();
      for (const { id } of images)
        if (uniqueImageIds.has(id)) return "Image id must be unique.";
        else uniqueImageIds.add(id);
    }
  }

  function validate(
    product: unknown
  ): asserts product is ProductPrivateInterface {
    const result = ProductSchema.safeParse(product, { errorMap });
    if (!result.success) throw result.error;
  }

  return Object.freeze({ make, edit, validate });
}