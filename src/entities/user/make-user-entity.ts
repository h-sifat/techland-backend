import { z } from "zod";
import { makeZodErrorMap } from "../../common/util/zod";

import {
  ACCOUNT_STATUSES,
  UserConfigInterface,
  UserPrivateInterface,
} from "./interface";
import type { MakeId } from "../../common/interface";

export type MakeUser_Argument = Pick<
  UserPrivateInterface,
  "password" | "name" | "email"
>;

export type EditUser_Argument = {
  user: UserPrivateInterface;
  changes: Partial<
    Pick<
      UserPrivateInterface,
      "accountStatus" | "password" | "name" | "email" | "addresses"
    >
  >;
};

export interface UserEntity {
  validate(user: unknown): asserts user is UserPrivateInterface;
  edit(arg: EditUser_Argument): Promise<Readonly<UserPrivateInterface>>;
  make(arg: MakeUser_Argument): Promise<Readonly<UserPrivateInterface>>;
}

export interface MakeUserEntity_Argument {
  makeId: MakeId;
  currentTimeMs(): number;
  config: UserConfigInterface;
  hashPassword(password: string): Promise<string>;
}

export function makeUserEntity(
  factoryArg: MakeUserEntity_Argument
): UserEntity {
  const { makeId, config, currentTimeMs, hashPassword } = factoryArg;

  // ========================[Validation Schemas]==========================
  const makeArgumentSchema = z
    .object({
      password: z
        .string()
        .min(config.MIN_PASSWORD_LENGTH)
        .max(config.MAX_PASSWORD_LENGTH),
      email: z.string().trim().email(),
      name: z.string().trim().min(1).max(config.MAX_NAME_LENGTH),
    })
    .strict();

  const editArgumentSchema = makeArgumentSchema
    .merge(
      z.object({
        addresses: z.array(z.string().min(1)),
        accountStatus: z.nativeEnum(ACCOUNT_STATUSES),
      })
    )
    .partial()
    .strict();

  const userSchema = z
    .object({
      id: z.string().min(1),
      password: z.string().min(1),
      email: z.string().trim().email(),
      addresses: z.array(z.string().min(1)),
      createdAt: z.number().positive().int(),
      accountStatus: z.nativeEnum(ACCOUNT_STATUSES),
      name: z.string().trim().min(1).max(config.MAX_NAME_LENGTH),
    })
    .strict();

  {
    // exhaustive check to make sure that userSchema contains all the
    // properties of UserPrivateInterface and no unknown properties.
    type UserSchema = z.infer<typeof userSchema>;
    type shouldBeEmptyObject = Omit<UserPrivateInterface, keyof UserSchema> &
      Omit<UserSchema, keyof UserPrivateInterface>;

    const x: shouldBeEmptyObject = {};
  }

  const errorMap = makeZodErrorMap({ objectName: "User" });
  // ========================[End Validation Schemas]======================

  async function make(
    arg: MakeUser_Argument
  ): Promise<Readonly<UserPrivateInterface>> {
    const result = makeArgumentSchema.safeParse(arg, { errorMap });
    if (!result.success) throw result.error.flatten();

    const user: Readonly<UserPrivateInterface> = Object.freeze({
      ...arg,
      id: makeId(),
      addresses: [],
      createdAt: currentTimeMs(),
      accountStatus: ACCOUNT_STATUSES.OPEN,
      password: await hashPassword(arg.password),
    });

    return user;
  }

  async function edit(
    arg: EditUser_Argument
  ): Promise<Readonly<UserPrivateInterface>> {
    const { changes: unValidatedChanges } = arg;

    const result = editArgumentSchema.safeParse(unValidatedChanges, {
      errorMap,
    });
    if (!result.success) throw result.error.flatten();

    const changes = result.data;
    const { user } = arg;

    // @WARNING don't change the destructuring order
    const editedUser: Readonly<UserPrivateInterface> = Object.freeze({
      ...user,
      ...changes,
      password: changes.password
        ? await hashPassword(changes.password)
        : user.password,
    });

    return editedUser;
  }

  function validate(user: unknown): asserts user is UserPrivateInterface {
    const result = userSchema.safeParse(user, { errorMap });
    if (!result.success) throw result.error.flatten();
  }

  return Object.freeze({ make, edit, validate });
}
