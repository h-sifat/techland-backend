import { createMD5Hash, makeId } from "../../common/util/index";
import { AddressConfigInterface } from "./interface";
import { makeAddressEntity, MakeAddress_Argument } from "./make-address-entity";

const config: AddressConfigInterface = Object.freeze({
  phoneLength: 5,
  maxCityLength: 5,
  zipCodeLength: 5,
  maxStreetLength: 5,
  maxDistrictLength: 5,
});

const Address = makeAddressEntity({
  config,
  makeId,
  createHash: createMD5Hash,
  currentTimeMs: () => Date.now(),
});

const validMakeAddressArg: MakeAddress_Argument = Object.freeze({
  userId: "id",
  phone: "a".repeat(config.phoneLength),
  city: "a".repeat(config.maxCityLength),
  zipCode: "a".repeat(config.zipCodeLength),
  street: "a".repeat(config.maxStreetLength),
  district: "a".repeat(config.maxDistrictLength),
});

describe("Address.make", () => {
  it(`creates an address object`, () => {
    const address = Address.make(validMakeAddressArg);

    expect(address).toEqual({
      isDeleted: false,
      ...validMakeAddressArg,
      id: expect.any(String),
      hash: expect.any(String),
      createdAt: expect.any(Number),
    });

    expect(Object.isFrozen(address)).toBeTruthy();
  });

  {
    const missingPropTests = (() => {
      const tests: any[] = [];
      for (const key in validMakeAddressArg) {
        let arg = { ...validMakeAddressArg };
        // @ts-ignore
        delete arg[key];

        tests.push({
          arg,
          case: `is missing the "${key}" property`,
          error: {
            formErrors: [],
            fieldErrors: { [key]: [expect.any(String)] },
          },
        });
      }

      return tests;
    })();

    it.each([
      {
        arg: { ...validMakeAddressArg, unknownProp: true },
        case: `contains unknown property`,
        error: { formErrors: [expect.any(String)], fieldErrors: {} },
      },
      ...missingPropTests,
      {
        arg: {
          ...validMakeAddressArg,
          city: "a".repeat(config.maxCityLength + 1),
        },
        case: `contains invalid property`,
        error: {
          formErrors: [],
          fieldErrors: { city: [expect.any(String)] },
        },
      },
    ])(`Address.make throws error if the arg $case`, ({ arg, error }) => {
      expect.assertions(1);
      try {
        // @ts-ignore
        Address.make(arg);
      } catch (ex) {
        expect(ex).toEqual(error);
      }
    });
  }
});

describe("Address.edit", () => {
  const address = Address.make(validMakeAddressArg);

  it(`edits an object`, () => {
    const newCity = "x".repeat(config.maxCityLength - 1);
    expect(address.city).not.toBe(newCity);

    const editedAddress = Address.edit({ address, changes: { city: newCity } });

    expect(editedAddress.hash).not.toBe(address.hash);
    expect(editedAddress).toEqual({
      ...address,
      city: newCity,
      hash: editedAddress.hash,
    });
  });

  it.each([
    {
      arg: { unknownProp: true },
      case: `contains unknown property`,
      error: { formErrors: [expect.any(String)], fieldErrors: {} },
    },
    {
      changes: { city: "" },
      case: "contains invalid properties",
      error: { formErrors: [], fieldErrors: { city: [expect.any(String)] } },
    },
  ])(`Address.edit throws error if changes $case`, ({ changes, error }) => {
    expect.assertions(1);
    try {
      // @ts-ignore
      Address.edit({ address, changes });
    } catch (ex) {
      expect(ex).toEqual(error);
    }
  });
});

describe("Address.validate", () => {
  const address = Address.make(validMakeAddressArg);
  it(`doesn't throw error if address is valid`, () => {
    expect(() => {
      // @ts-ignore Shut up TS
      Address.validate(address);
    }).not.toThrow();
  });

  it(`throws error if address is invalid`, () => {
    expect.assertions(1);
    try {
      // @ts-ignore Shut up TS
      Address.validate({ ...address, createdAt: "not a timestamp" });
    } catch (ex) {
      expect(ex).toEqual({
        formErrors: [],
        fieldErrors: { createdAt: [expect.any(String)] },
      });
    }
  });
});
