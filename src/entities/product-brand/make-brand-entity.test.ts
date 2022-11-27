import deepFreezeStrict from "deep-freeze-strict";
import { z } from "zod";
import { currentTimeMs, makeId } from "../../common/util";
import { makeProductBrandEntity } from "./make-brand-entity";

const ProductBrand = makeProductBrandEntity({ makeId, currentTimeMs });

const invalidData = deepFreezeStrict({
  _id: ["", "   ", 234],
  name: ["", "   ", 234],
  createdAt: [12.23423, -234, "2022-07-11"],
  lastModifiedAt: [12.23423, -234, "2022-07-11"],
});

describe("ProductBrand.make", () => {
  it(`makes a product brand`, () => {
    const name = "AMD";
    const brand = ProductBrand.make({ name });

    expect(brand).toEqual({
      name,
      _id: expect.any(String),
      createdAt: expect.any(Number),
      lastModifiedAt: expect.any(Number),
    });
  });

  it.each(["", "  ", 234])(
    `throws error if brand name is invalid: (%p)`,
    (name) => {
      expect.assertions(2);

      try {
        // @ts-ignore
        ProductBrand.make({ name });
      } catch (ex) {
        expect(ex).toBeInstanceOf(z.ZodError);
        expect(ex.flatten()).toEqual({
          formErrors: [],
          fieldErrors: { name: [expect.any(String)] },
        });
      }
    }
  );

  it(`throws error if arg contains unknown props`, () => {
    expect.assertions(2);
    try {
      // @ts-expect-error
      ProductBrand.make({ unknown: "who are you?" });
    } catch (ex) {
      expect(ex).toBeInstanceOf(z.ZodError);
      expect(ex.flatten()).toEqual({
        formErrors: [expect.any(String)],
        fieldErrors: expect.any(Object),
      });
    }
  });
});

describe("ProductBrand.edit", () => {
  const name = "A";
  const brand = ProductBrand.make({ name });
  it(`edits a brand`, async () => {
    const newName = name + "A";

    const editedBrand = ProductBrand.edit({
      brand,
      changes: { name: newName },
    });

    expect(editedBrand.name).toBe(newName);
  });

  it.each(["", "  ", 234])(
    `throws error if brand name is invalid: (%p)`,
    (name) => {
      expect.assertions(2);

      try {
        // @ts-ignore
        ProductBrand.edit({ brand, changes: { name } });
      } catch (ex) {
        expect(ex).toBeInstanceOf(z.ZodError);
        expect(ex.flatten()).toEqual({
          formErrors: [],
          fieldErrors: { name: [expect.any(String)] },
        });
      }
    }
  );

  it(`throws error if arg contains unknown props`, () => {
    expect.assertions(2);
    try {
      // @ts-expect-error
      ProductBrand.edit({ brand, changes: { unknown: "who are you?" } });
    } catch (ex) {
      expect(ex).toBeInstanceOf(z.ZodError);
      expect(ex.flatten()).toEqual({
        formErrors: [expect.any(String)],
        fieldErrors: expect.any(Object),
      });
    }
  });
});

describe("ProductBrand.Validate", () => {
  const brand = ProductBrand.make({ name: "Asus" });

  const testData = Object.entries(invalidData)
    .map(([field, values]) => values.map((value) => ({ field, value })))
    .flat();

  it.each(testData)(
    `throws error if $field is invalid ($value)`,
    ({ field, value }) => {
      expect.assertions(2);
      try {
        // @ts-ignore
        ProductBrand.validate({
          ...brand,
          [field]: value,
        });
      } catch (ex) {
        expect(ex).toBeInstanceOf(z.ZodError);
        expect(ex.flatten()).toEqual({
          formErrors: [],
          fieldErrors: { [field]: [expect.any(String)] },
        });
      }
    }
  );

  it(`throws error if arg contains unknown props`, () => {
    expect.assertions(2);
    try {
      // @ts-expect-error
      ProductBrand.validate({ ...brand, unknown: "who are you?" });
    } catch (ex) {
      expect(ex).toBeInstanceOf(z.ZodError);
      expect(ex.flatten()).toEqual({
        formErrors: [expect.any(String)],
        fieldErrors: expect.any(Object),
      });
    }
  });
});
