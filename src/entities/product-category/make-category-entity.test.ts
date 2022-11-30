import { z } from "zod";
import { CategoryInterface } from "./interface";
import deepFreezeStrict from "deep-freeze-strict";
import { makeProductCategoryEntity } from "./make-category-entity";
import { createMD5Hash, currentTimeMs, makeId } from "../../common/util";

const Category = makeProductCategoryEntity({
  makeId,
  currentTimeMs,
  createHash: createMD5Hash,
});

const validMakeCategoryArg = Object.freeze({
  name: "Components",
  parentId: makeId(),
  description: "Core components like CUPs, MOBOs",
});

const invalidData: Record<keyof CategoryInterface, any[]> = deepFreezeStrict({
  hash: [""],
  _id: ["", 321],
  parentId: ["", 234],
  imageId: ["", 324, {}],
  name: ["", 234, "   "],
  isDeleted: [0, 1, "false"],
  createdAt: [-2343, 234.42332],
  description: ["", 234, "   "],
});

const invalidMakeArgTestData = ["name", "description", "parentId"]
  .map((property) => {
    // @ts-ignore
    return invalidData[property].map((invalidValue) => ({
      property,
      makeArg: { ...validMakeCategoryArg, [property]: invalidValue },
    }));
  })
  .flat();

describe("Category.make", () => {
  it(`creates a category`, () => {
    const arg = Object.freeze({
      imageId: makeId(),
      parentId: makeId(),
      name: " Componets  ",
      description: "    description   ",
    });

    const category = Category.make(arg);
    expect(category).toEqual({
      ...arg,
      isDeleted: false,
      name: arg.name.trim(),
      _id: expect.any(String),
      hash: expect.any(String),
      createdAt: expect.any(Number),
      description: arg.description.trim(),
    });
  });

  it(`assigns null to imageId if not provided`, () => {
    const category = Category.make({ name: "a" });
    expect(category).toMatchObject({ imageId: null });
  });

  it.each(invalidMakeArgTestData)(
    `throws error if $property is invalid`,
    ({ makeArg, property }) => {
      expect.assertions(2);

      try {
        Category.make(makeArg);
      } catch (ex) {
        expect(ex).toBeInstanceOf(z.ZodError);
        expect(ex.flatten()).toMatchObject({
          formErrors: [],
          fieldErrors: { [property]: [expect.any(String)] },
        });
      }
    }
  );
});

describe("Category.edit", () => {
  const oldArg = Object.freeze({
    name: "a",
    parentId: "a",
    description: "a",
    imageId: makeId(),
  });
  const category = Category.make(oldArg);

  it(`can edit a category`, () => {
    const newArg = Object.freeze({
      name: "b",
      imageId: null,
      parentId: "b",
      isDeleted: true,
      description: "b",
    });

    const editedCategory = Category.edit({ category, changes: newArg });

    expect(editedCategory).toEqual({
      ...category,
      ...newArg,
      hash: expect.any(String),
    });
    expect(category.hash).not.toBe(editedCategory.hash);
  });

  it.each(invalidMakeArgTestData)(
    `throws error if $property is invalid`,
    ({ makeArg, property }) => {
      expect.assertions(2);

      try {
        Category.edit({ category, changes: makeArg });
      } catch (ex) {
        expect(ex).toBeInstanceOf(z.ZodError);
        expect(ex.flatten()).toMatchObject({
          formErrors: [],
          fieldErrors: { [property]: [expect.any(String)] },
        });
      }
    }
  );
});

describe("Category.validate", () => {
  it(`throws error if category is invalid`, () => {
    expect.assertions(2);

    const category = { ...Category.make(validMakeCategoryArg) };
    category.hash = "invalid hash";

    try {
      // @ts-ignore
      Category.validate(category);
    } catch (ex) {
      expect(ex).toBeInstanceOf(z.ZodError);
      expect(ex.flatten()).toMatchObject({
        fieldErrors: {},
        formErrors: [expect.any(String)],
      });
    }
  });
});
