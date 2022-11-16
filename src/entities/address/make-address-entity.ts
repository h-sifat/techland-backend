import { z } from "zod";

import type {
  AddressConfigInterface,
  AddressPublicInterface,
  AddressPrivateInterface,
} from "./interface";
import type { MakeId } from "../../common/interface";
import { makeZodErrorMap } from "../../common/util/zod";

export type MakeAddress_Argument = Omit<
  AddressPublicInterface,
  "id" | "createdAt"
> &
  Pick<AddressPrivateInterface, "userId">;
export interface EditAddress_Argument {
  address: AddressPrivateInterface;
  changes: Partial<Omit<AddressPublicInterface, "id">>;
}
export interface AddressEntity {
  edit(arg: EditAddress_Argument): Readonly<AddressPrivateInterface>;
  make(arg: MakeAddress_Argument): Readonly<AddressPrivateInterface>;
  validate(address: unknown): asserts address is AddressPrivateInterface;
}
export interface MakeAddressEntity_Argument {
  makeId: MakeId;
  currentTimeMs(): number;
  config: AddressConfigInterface;
  createHash(string: string): string;
}

export function makeAddressEntity(
  factoryArg: MakeAddressEntity_Argument
): AddressEntity {
  const { config, createHash, makeId, currentTimeMs } = factoryArg;

  // ===================== Validation Schemas =========================
  const makeAddressArgSchema = z
    .object({
      userId: z.string().trim().min(1),
      phone: z.string().trim().length(config.phoneLength),
      zipCode: z.string().trim().length(config.zipCodeLength),
      city: z.string().trim().min(1).max(config.maxCityLength),
      street: z.string().trim().min(1).max(config.maxStreetLength),
      district: z.string().trim().min(1).max(config.maxDistrictLength),
    })
    .strict();

  const editAddressArgSchema = makeAddressArgSchema
    .omit({ userId: true })
    .partial();

  const editArgumentSchemaErrorMap = makeZodErrorMap({
    objectName: "editedAddress",
  });

  const fullAddressSchema = makeAddressArgSchema
    .merge(
      z.object({
        isDeleted: z.boolean(),
        id: z.string().trim().min(1),
        hash: z.string().trim().min(1),
        createdAt: z.number().positive().int(),
      })
    )
    .strict()
    .refine((address) => address.hash === generateHash(address), {
      path: ["hash"],
      message: `The address is invalid because the hash doesn't match.`,
    });

  const addressSchemaErrorMap = makeZodErrorMap({
    objectName: "Address",
  });
  // ===================== End of Validation Schemas =========================

  function validate(
    address: unknown
  ): asserts address is AddressPrivateInterface {
    const result = fullAddressSchema.safeParse(address, {
      errorMap: addressSchemaErrorMap,
    });
    if (!result.success) throw result.error.flatten();
  }

  function make(arg: MakeAddress_Argument): Readonly<AddressPrivateInterface> {
    const result = makeAddressArgSchema.safeParse(arg, {
      errorMap: addressSchemaErrorMap,
    });
    if (!result.success) throw result.error.flatten();

    const address: Readonly<AddressPrivateInterface> = Object.freeze({
      id: makeId(),
      ...result.data,
      isDeleted: false,
      createdAt: currentTimeMs(),
      hash: generateHash({ ...result.data, isDeleted: false }),
    });

    return address;
  }

  function edit(arg: EditAddress_Argument): Readonly<AddressPrivateInterface> {
    const { address, changes: unValidatedChanges } = arg;

    const result = editAddressArgSchema.safeParse(unValidatedChanges, {
      errorMap: editArgumentSchemaErrorMap,
    });
    if (!result.success) throw result.error.flatten();

    const changes = result.data;
    const editedAddress = { ...address, ...changes };
    const hash = generateHash(editedAddress);

    return Object.freeze({ ...editedAddress, hash });
  }

  function generateHash(
    address: Omit<AddressPrivateInterface, "id" | "hash" | "createdAt">
  ): string {
    const { userId, city, zipCode, street, phone, district, isDeleted } =
      address;

    // @WARNING: Don't change the concatenation order below
    const addressString =
      userId + phone + street + city + district + zipCode + isDeleted;
    return createHash(addressString);
  }

  return Object.freeze({ make, edit, validate });
}
