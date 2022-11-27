import {
  isNever,
  makeZodErrorMap,
  MissingOrUnknownPropertiesInSchema,
} from "../../common/util/zod";
import { z } from "zod";

import type { MakeId } from "../../common/interface";
//  ======== end of imports ========

export type MakeBrand_Argument = Pick<ProductBrandInterface, "name">;

export interface EditBrand_Argument {
  changes: MakeBrand_Argument;
  brand: ProductBrandInterface;
}

export interface MakeProductBrandEntity_Argument {
  makeId: MakeId;
  currentTimeMs(): number;
}

export interface ProductBrandEntity {
  edit(arg: EditBrand_Argument): Readonly<ProductBrandInterface>;
  make(arg: MakeBrand_Argument): Readonly<ProductBrandInterface>;
  validate(brand: unknown): asserts brand is ProductBrandInterface;
}

export function makeProductBrandEntity(
  factoryArg: MakeProductBrandEntity_Argument
): ProductBrandEntity {
  const { makeId, currentTimeMs } = factoryArg;

  // ==================[Validation Schemas]=======================
  const MakeBrandArgumentSchema = z
    .object({
      name: z.string().trim().min(1),
    })
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof MakeBrandArgumentSchema>,
      MakeBrand_Argument
    >;
    isNever<shouldBeNever>();
  }

  const ProductBrandSchema = z
    .object({
      _id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      createdAt: z.number().positive().int(),
      lastModifiedAt: z.number().positive().int(),
    })
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof ProductBrandSchema>,
      ProductBrandInterface
    >;
    isNever<shouldBeNever>();
  }

  const errorMap = makeZodErrorMap({ objectName: "ProductBrand" });
  // ==================[End of Validation Schemas]===================

  function make(arg: MakeBrand_Argument): Readonly<ProductBrandInterface> {
    const brandArg = MakeBrandArgumentSchema.parse(arg, { errorMap });
    const timestamp = currentTimeMs();

    const brand: Readonly<ProductBrandInterface> = Object.freeze({
      ...brandArg,
      _id: makeId(),
      createdAt: timestamp,
      lastModifiedAt: timestamp,
    });

    return brand;
  }

  function edit(arg: EditBrand_Argument): Readonly<ProductBrandInterface> {
    const changes = MakeBrandArgumentSchema.parse(arg.changes, { errorMap });

    const editedBrand: Readonly<ProductBrandInterface> = Object.freeze({
      ...arg.brand,
      ...changes,
      lastModifiedAt: currentTimeMs(),
    });

    return editedBrand;
  }

  function validate(brand: unknown): asserts brand is ProductBrandInterface {
    ProductBrandSchema.parse(brand);
  }

  return Object.freeze({ make, edit, validate });
}
