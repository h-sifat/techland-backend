import {
  EditProduct_Changes,
  makeProductEntity,
  MakeProduct_Argument,
} from "./make-product-entity";
import { z } from "zod";
import { inspect } from "util";
import { PRICE_UNITS } from "./interface";
import deepFreeze from "deep-freeze-strict";
import { currentTimeMs, makeId } from "../../common/util";

const sanitizeHTML = jest.fn((str) => str);
const Product = makeProductEntity({
  makeId,
  deepFreeze,
  sanitizeHTML,
  currentTimeMs,
});

beforeEach(() => {
  sanitizeHTML.mockClear();
});

const validMakeProductArgument: Readonly<MakeProduct_Argument> = deepFreeze({
  price: 184,
  inStock: 64,
  brand: "AMD",
  priceUnit: "USD",
  addedBy: makeId(),
  categoryId: makeId(),
  name: "AMD Ryzen 5 5600 Processor",
  description: "Very powerful processor.",
  images: [{ id: "claes1sy001v1s4pj4it0crvn.jpg", isMain: true }],
  specifications: {
    "Memory Specifications": { Type: "DDR4" },
    "Basic Information": { Cores: "6", Cache: "Total L1 Cache: 384KB" },
  },
  shortDescriptions: ["Model: Ryder 5 5600", "Speed: 3.5GHz up to 4.4GHz"],
});

const validEditProductChangesArgument: Readonly<EditProduct_Changes> =
  deepFreeze({
    price: validMakeProductArgument.price + 1,
    inStock: validMakeProductArgument.inStock + 1,
    brand: validMakeProductArgument.brand + "X",
    priceUnit:
      validMakeProductArgument.priceUnit === PRICE_UNITS.USD
        ? PRICE_UNITS.TAKA
        : PRICE_UNITS.USD,
    addedBy: makeId(),
    categoryId: makeId(),
    name: validMakeProductArgument.name + "x",
    description: validMakeProductArgument.description + "x",
    images: [{ id: `${makeId()}.jpg`, isMain: true }],
    specifications: {
      bla: { bla: "bla" },
    },
    shortDescriptions: [
      "Testing sucks!",
      "I'm tired and suffering from cold-fever",
      "with severe headache",
    ],
    isHidden: false,
    isDeleted: false,
  });

const invalidDataForMakeArgument: Record<keyof MakeProduct_Argument, any[]> =
  deepFreeze({
    price: [-2343, "230"],
    priceUnit: ["EUR", ""],
    inStock: [-234, 234.232],
    shortDescriptions: [[], [""], ["   "], {}],
    name: ["", "  ", 324, ["string"], {}, null],
    brand: ["", "  ", 324, ["string"], {}, null],
    addedBy: ["", 324, ["string"], {}, null],
    categoryId: ["", 324, ["string"], {}, null],
    description: ["", "  ", 324, ["string"], {}, null],
    specifications: [null, { a: 1 }, { b: { c: 2 } }, { a: { b: "   " } }],
    images: [
      {},
      null,
      [{ id: "" }],
      [{ id: "  " }],
      [{ isMain: true }],
      [{ id: "has_no_main_image" }],
      [
        { id: "a", isMain: true },
        { id: "b", isMain: true },
      ],
      [
        { id: "a", isMain: true },
        { id: "a", isMain: true },
      ],
    ],
    isHidden: [0, 1, "true"],
    isDeleted: [0, 1, "false"],
  });

const testData = deepFreeze([
  {
    productArg: null,
    errorType: "formErrors",
    case: "not plain object",
  },
  {
    errorType: "formErrors",
    case: "has unknown properties",
    productArg: { ...validMakeProductArgument, unknownProps: "oh, hi!" },
  },
  ...Object.keys(validMakeProductArgument).map((property) => {
    const productArg = { ...validMakeProductArgument };
    // @ts-expect-error
    delete productArg[property];
    return {
      productArg,
      invalidField: property,
      errorType: "fieldErrors",
      case: `missing "${property}" filed`,
    };
  }),
  ...Object.entries(invalidDataForMakeArgument)
    .filter(([property]) => property in validMakeProductArgument)
    .map(([property, invalidDataArray]) => {
      return invalidDataArray.map((data) => {
        return {
          productArg: { ...validMakeProductArgument, [property]: data },
          invalidField: property,
          errorType: "fieldErrors",
          case: `"${property}" (${inspect(data)}) is invalid`,
        };
      });
    })
    .flat(),
]);

describe("Product.make", () => {
  describe("Functionality", () => {
    it(`creates a product object`, () => {
      const product = Product.make(validMakeProductArgument);
      expect(product).toEqual({
        ...validMakeProductArgument,
        isHidden: false,
        isDeleted: false,
        _id: expect.any(String),
        addedBy: expect.any(String),
        createdAt: expect.any(Number),
      });
    });

    it(`sanitizes the description`, () => {
      const sanitizedDescription = "    some description here   ";
      sanitizeHTML.mockReturnValueOnce(sanitizedDescription);

      expect(sanitizedDescription).not.toBe(
        validMakeProductArgument.description
      );

      const product = Product.make(validMakeProductArgument);
      expect(product.description).toBe(sanitizedDescription.trim());
    });
  });

  describe("Validation", () => {
    it.each(testData)(
      `throws if: $case`,
      // @ts-ignore
      ({ productArg, errorType, invalidField }) => {
        expect.assertions(2);
        try {
          // @ts-ignore
          Product.make(productArg);
        } catch (ex) {
          expect(ex).toBeInstanceOf(z.ZodError);

          if (errorType === "formErrors")
            expect(ex.flatten()).toMatchObject({
              fieldErrors: {},
              formErrors: [expect.any(String)],
            });
          else
            expect(ex.flatten()).toMatchObject({
              formErrors: [],
              fieldErrors: {
                [invalidField]: expect.arrayContaining([expect.any(String)]),
              },
            });
        }
      }
    );
  });
});

describe("Product.edit", () => {
  const product = Product.make(validMakeProductArgument);

  it(`edits a product`, () => {
    const editedProduct = Product.edit({
      product,
      changes: validEditProductChangesArgument,
    });

    expect(editedProduct).toEqual({
      ...product,
      ...validEditProductChangesArgument,
    });
  });

  {
    const testData = Object.entries(validEditProductChangesArgument).map(
      ([key, value]) => ({ key, value })
    );

    it.each(testData)(`can edit a single field: $key`, ({ key, value }) => {
      const changes = { [key]: value };

      const editedProduct = Product.edit({
        product,
        changes,
      });

      expect(editedProduct).toEqual({ ...product, ...changes });
    });
  }
});

{
  const testData = Object.entries(invalidDataForMakeArgument)
    // .filter(([key]) => ["isDeleted", "isHidden"].includes(key))
    .map(([key, values]) =>
      values.map((value) => ({
        changes: { [key]: value },
        key,
        case: `"${key} (${inspect(value)}) is invalid"`,
      }))
    )
    .flat();

  const product = Product.make(validMakeProductArgument);

  const editTestFunction = ({ changes }: any) => {
    Product.edit({ product, changes });
  };

  const validateTestFunction = ({ changes }: any) => {
    // @ts-ignore
    Product.validate({ ...product, ...changes });
  };

  describe.each([
    { name: "Product.edit", testFunc: editTestFunction },
    { name: "Product.validate", testFunc: validateTestFunction },
  ])("$name", ({ testFunc }) => {
    it.each(testData)(`throws if $case`, ({ changes, key }) => {
      expect.assertions(2);
      try {
        testFunc({ product, changes });
      } catch (ex) {
        expect(ex).toBeInstanceOf(z.ZodError);
        expect(ex.flatten()).toMatchObject({
          formErrors: [],
          fieldErrors: { [key]: expect.arrayContaining([expect.any(String)]) },
        });
      }
    });
  });
}
