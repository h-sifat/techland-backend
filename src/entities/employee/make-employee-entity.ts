import { z } from "zod";
import {
  isNever,
  makeZodErrorMap,
  MissingOrUnknownPropertiesInSchema,
} from "../../common/util/zod";

import type {
  EmployeeConfig,
  AdminPermissions,
  EmployeePermissions,
  IsAdminAndPermissions,
  EmployeePrivateInterface,
} from "./interface";
import type { MakeId } from "../../common/interface";

export type MakeEmployee_Argument = Pick<
  EmployeePrivateInterface,
  "name" | "email" | "password" | "isAdmin"
> &
  Partial<Pick<IsAdminAndPermissions, "permissions">>;
export interface EditEmployee_Argument {
  employee: EmployeePrivateInterface;
  changes: Partial<
    Pick<EmployeePrivateInterface, "name" | "email" | "password" | "isDeleted">
  > &
    Partial<IsAdminAndPermissions>;
}

export interface EmployeeEntity {
  validate(arg: unknown): asserts arg is EmployeePrivateInterface;
  edit(arg: EditEmployee_Argument): Promise<Readonly<EmployeePrivateInterface>>;
  make(arg: MakeEmployee_Argument): Promise<Readonly<EmployeePrivateInterface>>;
}

export interface MakeEmployeeEntity_Argument {
  makeId: MakeId;
  config: EmployeeConfig;
  currentTimeMs(): number;
  hashPassword(password: string): Promise<string>;
}

export function makeEmployeeEntity(
  factoryArg: MakeEmployeeEntity_Argument
): EmployeeEntity {
  const { makeId, config, currentTimeMs, hashPassword } = factoryArg;

  // ===================[Validation Schemas]====================
  const EmployeePermissionsSchema = z
    .object({
      addProducts: z.boolean().default(false),
      editProducts: z.boolean().default(false),
      deleteProducts: z.boolean().default(false),

      replyToChats: z.boolean().default(false),
      answerQuestions: z.boolean().default(false),

      manageOrders: z.boolean().default(false),
    })
    .strict()
    .default({});

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof EmployeePermissionsSchema>,
      EmployeePermissions
    >;
    isNever<shouldBeNever>();
  }

  const AdminPermissionsSchema = z
    .object({
      readAdmins: z.boolean().default(false),
      deleteAdmins: z.boolean().default(false),

      addEmployees: z.boolean().default(false),
      editEmployees: z.boolean().default(false),
      deleteEmployees: z.boolean().default(false),
    })
    .strict()
    .default({});

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof AdminPermissionsSchema>,
      AdminPermissions
    >;
    isNever<shouldBeNever>();
  }

  const IsAdminAndPermissionsSchema = z.discriminatedUnion("isAdmin", [
    z
      .object({
        isAdmin: z.literal(true),
        permissions: AdminPermissionsSchema,
      })
      .strict(),

    z
      .object({
        isAdmin: z.literal(false),
        permissions: EmployeePermissionsSchema,
      })
      .strict(),
  ]);

  const NameAndEmail = z
    .object({
      email: z.string().trim().email(),
      name: z.string().trim().min(1).max(config.MAX_NAME_LENGTH),
    })
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof NameAndEmail>,
      Pick<EmployeePrivateInterface, "name" | "email">
    >;
    isNever<shouldBeNever>();
  }

  const MakeArgumentSchema = z
    .object({
      password: z
        .string()
        .min(config.MIN_PASSWORD_LENGTH)
        .max(config.MAX_PASSWORD_LENGTH),
      isAdmin: z.boolean().default(false),
      permissions: z.record(z.boolean()).default({}),
    })
    .merge(NameAndEmail)
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof MakeArgumentSchema>,
      MakeEmployee_Argument
    >;
    isNever<shouldBeNever>();
  }

  const ChangesSchema = z
    .object({
      isAdmin: z.boolean(),
      password: z.string().min(1),
      isDeleted: z.boolean().default(false),
      permissions: z.record(z.boolean()).default({}),
    })
    .partial()
    .merge(NameAndEmail.partial())
    .strict();
  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof ChangesSchema>,
      EditEmployee_Argument["changes"]
    >;
    isNever<shouldBeNever>();
  }

  const EmployeeSchema = z
    .object({
      isAdmin: z.boolean(),
      id: z.string().min(1),
      isDeleted: z.boolean(),
      password: z.string().min(1),
      createdAt: z.number().positive().int(),
      permissions: z.record(z.boolean()).default({}),
    })
    .merge(NameAndEmail)
    .strict();

  {
    type shouldBeNever = MissingOrUnknownPropertiesInSchema<
      z.infer<typeof EmployeeSchema>,
      EmployeePrivateInterface
    >;
    isNever<shouldBeNever>();
  }

  const errorMap = makeZodErrorMap({ objectName: "Employee" });

  // ===================[End Validation Schemas]================

  async function make(
    arg: MakeEmployee_Argument
  ): Promise<Readonly<EmployeePrivateInterface>> {
    const validatedArg = (() => {
      const result = MakeArgumentSchema.safeParse(arg, { errorMap });
      if (!result.success) throw result.error.flatten();
      return result.data;
    })();

    const isAdminAndPermissions: IsAdminAndPermissions = (() => {
      const _isAdminAndPermissions = {
        isAdmin: validatedArg.isAdmin,
        permissions: validatedArg.permissions,
      };
      const result = IsAdminAndPermissionsSchema.safeParse(
        _isAdminAndPermissions,
        { errorMap }
      );

      if (!result.success) throw result.error.flatten();
      return result.data;
    })();

    const employee: Readonly<EmployeePrivateInterface> = Object.freeze({
      ...validatedArg,
      ...isAdminAndPermissions,
      id: makeId(),
      isDeleted: false,
      createdAt: currentTimeMs(),
      password: await hashPassword(validatedArg.password),
    });

    return employee;
  }

  /**
   * @NOTE: "isAdmin"  and "permissions" must be passed
   * together in the "changes" object
   * */
  async function edit(
    arg: EditEmployee_Argument
  ): Promise<Readonly<EmployeePrivateInterface>> {
    const { changes: unValidatedChanges, employee } = arg;
    const changes = (() => {
      const result = ChangesSchema.safeParse(unValidatedChanges, { errorMap });
      if (!result.success) throw result.error.flatten();
      return result.data;
    })();

    const isAdminAndPermissions: IsAdminAndPermissions = (() => {
      const _isAdminAndPermissions = {
        isAdmin: changes.isAdmin || employee.isAdmin,
        permissions: changes.permissions || employee.permissions,
      };
      const result = IsAdminAndPermissionsSchema.safeParse(
        _isAdminAndPermissions,
        { errorMap }
      );

      if (!result.success) throw result.error.flatten();
      return result.data;
    })();

    // @WARNING don't change the destructuring order
    const editedEmployee: Readonly<EmployeePrivateInterface> = Object.freeze({
      ...employee,
      ...changes,
      ...isAdminAndPermissions,
      password: changes.password
        ? await hashPassword(changes.password)
        : employee.password,
    });

    return editedEmployee;
  }

  function validate(arg: unknown): asserts arg is EmployeePrivateInterface {
    const result = EmployeeSchema.safeParse(arg, { errorMap });
    if (!result.success) throw result.error.flatten();

    const employee = result.data;

    {
      const isAdminAndPermissions = {
        isAdmin: employee.isAdmin,
        permissions: employee.permissions,
      };
      const result = IsAdminAndPermissionsSchema.safeParse(
        isAdminAndPermissions,
        { errorMap }
      );
      if (!result.success) throw result.error.flatten();
    }
  }

  return Object.freeze({ make, edit, validate });
}
