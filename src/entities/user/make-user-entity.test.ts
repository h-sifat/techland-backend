import {
  ACCOUNT_STATUSES,
  UserConfigInterface,
  UserPrivateInterface,
} from "./interface";
import { makeUserEntity } from "./make-user-entity";
import { createMD5Hash, currentTimeMs, makeId } from "../../common/util";

const config: Readonly<UserConfigInterface> = Object.freeze({
  MAX_NAME_LENGTH: 5,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
});

const User = makeUserEntity({
  config,
  makeId,
  currentTimeMs,
  hashPassword: (pass) => Promise.resolve(createMD5Hash(pass)),
});

const validMakeUserArg = Object.freeze({
  email: "a@b.com",
  name: "a".repeat(config.MAX_NAME_LENGTH - 1),
  password: "p".repeat(config.MIN_PASSWORD_LENGTH + 1),
});

describe("User.make", () => {
  it(`creates an user object`, async () => {
    const user = await User.make(validMakeUserArg);

    expect(user).toEqual({
      ...validMakeUserArg,
      addresses: [],
      id: expect.any(String),
      password: expect.any(String),
      createdAt: expect.any(Number),
      accountStatus: ACCOUNT_STATUSES.OPEN,
    });
    expect(user.password).not.toBe(validMakeUserArg.password);
  });

  it.each([
    {
      arg: { ...validMakeUserArg, unknown: "who are you?" },
      case: "arg contains unknown props",
      error: { formErrors: [expect.any(String)], fieldErrors: {} },
    },
    {
      arg: { ...validMakeUserArg, name: undefined },
      case: "arg is missing required property",
      error: { formErrors: [], fieldErrors: { name: [expect.any(String)] } },
    },
    {
      arg: { ...validMakeUserArg, email: "not_email" },
      case: "email is invalid",
      error: { formErrors: [], fieldErrors: { email: [expect.any(String)] } },
    },
    {
      arg: {
        ...validMakeUserArg,
        name: "a".repeat(config.MAX_NAME_LENGTH + 1),
      },
      case: "name length is more than config.MAX_NAME_LENGTH",
      error: { formErrors: [], fieldErrors: { name: [expect.any(String)] } },
    },
    {
      arg: {
        ...validMakeUserArg,
        password: "a".repeat(config.MIN_PASSWORD_LENGTH - 1),
      },
      case: "password length is less than config.MIN_PASSWORD_LENGTH",
      error: {
        formErrors: [],
        fieldErrors: { password: [expect.any(String)] },
      },
    },
    {
      arg: {
        ...validMakeUserArg,
        password: "a".repeat(config.MAX_PASSWORD_LENGTH + 1),
      },
      case: "password length is more than config.MAX_PASSWORD_LENGTH",
      error: {
        formErrors: [],
        fieldErrors: { password: [expect.any(String)] },
      },
    },
  ])(`throws error if $case`, async ({ arg, error }) => {
    expect.assertions(1);

    try {
      // @ts-ignore
      await User.make(arg);
    } catch (ex) {
      expect(ex).toEqual(error);
    }
  });
});

describe("User.edit", () => {
  const userArg = Object.freeze({
    email: "a@b.com",
    name: "a".repeat(config.MAX_NAME_LENGTH - 1),
    password: "a".repeat(config.MAX_PASSWORD_LENGTH - 1),
  });

  let user: UserPrivateInterface;

  beforeAll(async () => {
    user = await User.make(userArg);
  });

  it(`edits an user`, async () => {
    const changes = Object.freeze({
      email: "x@x.com",
      addresses: [makeId()],
      accountStatus: ACCOUNT_STATUSES.BANNED,
      name: "x".repeat(config.MAX_NAME_LENGTH - 1),
      password: "x".repeat(config.MAX_PASSWORD_LENGTH - 1),
    });

    const editedUser = await User.edit({ user, changes });
    expect(editedUser).toEqual({
      ...user,
      ...changes,
      password: expect.any(String),
    });

    expect(user.password).not.toBe(editedUser.password);
    // the password should be hashed hashed
    expect(editedUser.password).not.toBe(changes.password);
  });

  it.each([
    {
      changes: null,
      case: `changes is not an object`,
      error: { formErrors: [expect.any(String)], fieldErrors: {} },
    },
    {
      changes: { id: "trying_to_change_the_id" },
      case: `changes contains unknown properties`,
      error: { formErrors: [expect.any(String)], fieldErrors: {} },
    },
    {
      changes: { name: ["not_a_string"] },
      case: `name is invalid`,
      error: { formErrors: [], fieldErrors: { name: [expect.any(String)] } },
    },
  ])(`throws error if $case`, async ({ changes, error }) => {
    expect.assertions(1);

    try {
      // @ts-ignore
      await User.edit({ user, changes });
    } catch (ex) {
      expect(ex).toEqual(error);
    }
  });
});

describe("User.validate", () => {
  let user: UserPrivateInterface;

  beforeAll(async () => {
    user = await User.make(validMakeUserArg);
  });

  it(`doesn't throw error if user is valid`, async () => {
    expect(() => {
      // @ts-ignore
      User.validate(user);
    }).not.toThrow();
  });

  it(`throws error if user is invalid`, async () => {
    expect(() => {
      // @ts-ignore
      User.validate({ ...user, id: undefined });
    }).toThrow();
  });
});
