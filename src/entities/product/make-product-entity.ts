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
  MakeProduct_Argument & Pick<ProductPrivateInterface, "isDeleted" | "isHidden">
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
      images: z.array(ProductImageSchema),
      inStock: z.number().positive().int(),
      priceUnit: z.nativeEnum(PRICE_UNITS),
      specifications: z.record(SpecificationSchema),
      shortDescriptions: z.array(z.string().trim().min(1)).min(1),

      description: z
        .string()
        .trim()
        .min(1)
        .transform((html) => sanitizeHTML(html).trim()),
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
      isDeleted: z.boolean(),
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
    isDeleted: z.boolean(),

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
      if (!result.success) throw result.error.flatten();
      return result.data;
    })();

    assertValidImages(productData.images);

    const product: Readonly<ProductPrivateInterface> = deepFreeze({
      ...productData,
      _id: makeId(),
      isHidden: false,
      isDeleted: false,
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
      if (!result.success) throw result.error.flatten();
      return result.data;
    })();

    const editedProduct = { ...product, ...changes };
    assertValidImages(editedProduct.images);

    return deepFreeze(editedProduct);
  }

  function assertValidImages(images: ProductImage[]) {
    const mainImage = images.filter((image) => image.isMain);
    if (!mainImage.length)
      throw {
        formErrors: [],
        fieldErrors: { images: ["No main image found."] },
      };

    if (mainImage.length > 1)
      throw {
        formErrors: [],
        fieldErrors: {
          images: ["Only one image can be selected as the main image."],
        },
      };

    {
      const uniqueImageIds = new Set();
      for (const { id } of images)
        if (uniqueImageIds.has(id))
          throw {
            formErrors: [],
            fieldErrors: { images: ["Image id must be unique."] },
          };
        else uniqueImageIds.add(id);
    }
  }

  function validate(
    product: unknown
  ): asserts product is ProductPrivateInterface {
    const result = ProductSchema.safeParse(product, { errorMap });
    if (!result.success) throw result.error.flatten();

    assertValidImages(result.data.images);
  }

  return Object.freeze({ make, edit, validate });
}
