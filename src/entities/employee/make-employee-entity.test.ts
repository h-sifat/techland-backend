import { EmployeeConfig } from "./interface";
import { makeEmployeeEntity } from "./make-employee-entity";
import { createMD5Hash, currentTimeMs, makeId } from "../../common/util";
import { z } from "zod";

const config: EmployeeConfig = Object.freeze({
  MAX_NAME_LENGTH: 5,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
});

const nameEmailAndPass = Object.freeze({
  name: "Alex",
  email: "a@b.com",
  password: "a".repeat(config.MIN_PASSWORD_LENGTH + 1),
});

const defaultNonAdminPermissions = Object.freeze({
  addProducts: false,
  editProducts: false,
  manageOrders: false,
  replyToChats: false,
  deleteProducts: false,
  answerQuestions: false,
} as const);

const defaultAdminPermissions = Object.freeze({
  readAdmins: false,
  deleteAdmins: false,
  addEmployees: false,
  editEmployees: false,
  deleteEmployees: false,
} as const);

const Employee = makeEmployeeEntity({
  config,
  makeId,
  currentTimeMs,
  hashPassword: (p) => Promise.resolve(createMD5Hash(p)),
});

describe("Employee.make", () => {
  it(`creates a non-admin employee if isAdmin is false`, async () => {
    const employee = await Employee.make({
      isAdmin: false,
      ...nameEmailAndPass,
    });

    expect(employee).toEqual({
      ...nameEmailAndPass,
      _id: expect.any(String),
      password: expect.any(String),
      createdAt: expect.any(Number),
      isAdmin: false,
      isDeleted: false,
      permissions: defaultNonAdminPermissions,
    });
  });

  it(`creates an admin employee if isAdmin is true`, async () => {
    const employee = await Employee.make({
      isAdmin: true,
      ...nameEmailAndPass,
    });

    expect(employee).toEqual({
      ...nameEmailAndPass,
      _id: expect.any(String),
      password: expect.any(String),
      createdAt: expect.any(Number),
      isAdmin: true,
      isDeleted: false,
      permissions: defaultAdminPermissions,
    });
  });
});

describe("Employee.edit", () => {
  it(`can edit an employee`, async () => {
    const oldArg = {
      isAdmin: false,
      email: "old@a.com",
      name: "a".repeat(config.MAX_NAME_LENGTH - 1),
      password: "a".repeat(config.MIN_PASSWORD_LENGTH + 1),
    };

    const employee = await Employee.make(oldArg);

    const changes = {
      email: "new@a.com",
      name: "b".repeat(config.MAX_NAME_LENGTH - 1),
      password: "b".repeat(config.MIN_PASSWORD_LENGTH + 1),
    };

    const editedEmployee = await Employee.edit({ employee, changes });

    expect(employee.password).not.toBe(editedEmployee.password);
    expect(editedEmployee).toEqual({
      ...employee,
      ...changes,
      password: expect.any(String),
    });
  });
});

describe("Employee.validate", () => {
  it(`doesn't throw error if employee object is valid`, async () => {
    expect.assertions(0);

    const employee = await Employee.make({
      ...nameEmailAndPass,
      isAdmin: false,
    });

    try {
      // @ts-ignore Come on!
      Employee.validate(employee);
    } catch (ex) {
      expect(1).toBe(1);
    }
  });

  it(`throws error if employee is invalid`, async () => {
    expect.assertions(2);

    const employee = await Employee.make({
      ...nameEmailAndPass,
      isAdmin: false,
    });

    try {
      // @ts-ignore Come on!
      Employee.validate({ ...employee, _id: undefined });
    } catch (ex) {
      expect(ex).toBeInstanceOf(z.ZodError);
      expect(ex.flatten()).toEqual({
        formErrors: [],
        fieldErrors: { _id: [expect.any(String)] },
      });
    }
  });
});

{
  const validPermissionsForIsAdminValue = Object.keys(defaultAdminPermissions)
    .map((permission) =>
      Object.freeze({
        isAdmin: true,
        pName: permission,
        permissions: { [permission]: true },
      })
    )
    .concat(
      // @ts-ignore
      Object.keys(defaultNonAdminPermissions).map((permission) =>
        Object.freeze({
          isAdmin: false,
          pName: permission,
          permissions: { [permission]: true },
        })
      )
    );

  // we are toggling the isAdmin value so that
  // the permissions become invalid
  const invalidPermissionForIsAdminValue = validPermissionsForIsAdminValue.map(
    (object) => ({ ...object, isAdmin: !object.isAdmin })
  );

  const editTestFunction = async ({ isAdmin, permissions, employee }: any) => {
    const edited = await Employee.edit({
      employee,
      changes: { isAdmin, permissions },
    });

    expect(edited.isAdmin).toBe(isAdmin);
    expect(edited.permissions).toMatchObject(permissions);
  };

  const makeTestFunction = async ({ isAdmin, permissions }: any) => {
    await Employee.make({ isAdmin, permissions, ...nameEmailAndPass });
  };

  describe.each([
    { name: "Employee.edit", testFunc: editTestFunction },
    { name: "Employee.make", testFunc: makeTestFunction },
  ])(`$name`, ({ testFunc }) => {
    let employee: any;
    beforeAll(async () => {
      employee = await Employee.make({ isAdmin: false, ...nameEmailAndPass });
    });

    it.each(validPermissionsForIsAdminValue)(
      `can set the "$pName" permission if "isAdmin" is $isAdmin`,
      async ({ isAdmin, permissions }) => {
        try {
          await testFunc({ isAdmin, permissions, employee });
        } catch (ex) {
          // the following assertion makes sure
          // that the above function doesn't throw.
          expect("not to throw").toBe("but it threw");
        }
      }
    );

    it.each(invalidPermissionForIsAdminValue)(
      `cannot set the "$pName" permission if "isAdmin" is $isAdmin`,
      async ({ isAdmin, permissions }) => {
        expect.assertions(2);
        try {
          await testFunc({ isAdmin, permissions, employee });
        } catch (ex) {
          expect(ex).toBeInstanceOf(z.ZodError);
          expect(ex.flatten()).toEqual({
            formErrors: [],
            fieldErrors: { permissions: [expect.any(String)] },
          });
        }
      }
    );
  });
}
