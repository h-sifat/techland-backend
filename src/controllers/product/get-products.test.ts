import { HttpRequest } from "../interface";
import { deepFreeze } from "../../common/util/deep-freeze";
import { makeGetProducts, MakeGetProducts_Argument } from "./get-products";

const CategoryService = Object.freeze({
  findSubCategories: jest.fn(),
});

const ProductService = Object.freeze({
  listProducts: jest.fn(),
  searchProducts: jest.fn(),
  findProductByIds: jest.fn(),
  findSimilarProducts: jest.fn(),
  getSearchSuggestions: jest.fn(),
});

const WithTransaction = jest.fn();
const config: MakeGetProducts_Argument["config"] = Object.freeze({
  MAX_FIND_BY_IDS: 20,
  MAX_SIMILAR_PRODUCTS: 20,
  MAX_PRODUCTS_PER_PAGE: 40,
  MAX_SEARCH_SUGGESTIONS: 20,
  MAX_SEARCH_QUERY_LENGTH: 150,

  DEFAULT_PRODUCTS_PER_PAGE: 20,
  DEFAULT_SIMILAR_PRODUCTS_COUNT: 5,
  DEFAULT_SEARCH_SUGGESTIONS_COUNT: 5,
});

const getProducts = makeGetProducts({
  config,
  ProductService,
  CategoryService,
  WithTransaction,
});

beforeEach(() => {
  Object.values(CategoryService).forEach((service) => service.mockReset());
  Object.values(ProductService).forEach((service) => service.mockReset());
  WithTransaction.mockReset();
});

const validQueryDataset = deepFreeze({
  list: {
    qType: "list",
    brandIds: ["a", "b"],
    sortBy: { price: "-1" },
    priceRange: { min: 100, max: 300 },
    pagination: {
      pageNumber: 1,
      itemsPerPage: config.DEFAULT_PRODUCTS_PER_PAGE,
    },
  },
  search: {
    qType: "search",
    query: "Amd Ryzen",
    pagination: {
      pageNumber: 1,
      itemsPerPage: config.DEFAULT_PRODUCTS_PER_PAGE,
    },
  },

  byIds: {
    qType: "byIds",
    ids: ["a", "b"],
  },

  suggestions: {
    query: "MSI",
    qType: "suggestions",
    count: config.DEFAULT_SEARCH_SUGGESTIONS_COUNT - 1,
  },

  similar: {
    qType: "similar",
    id: "a",
    count: config.MAX_SIMILAR_PRODUCTS - 1,
  },
});

const invalidPaginationValues = deepFreeze([
  {},
  { pageNumber: 1 },
  { itemsPerPage: 1 },
  { itemsPerPage: -4, pageNumber: 2 },
  { itemsPerPage: 4, pageNumber: -2 },
  { itemsPerPage: 4, pageNumber: -2.5 },
  { itemsPerPage: 4.323, pageNumber: 2 },
  { itemsPerPage: config.MAX_PRODUCTS_PER_PAGE + 1, pageNumber: 2 },
]);

const invalidQueryDataSet = deepFreeze({
  list: {
    categoryId: [""],
    sortBy: [{}, { price: 1 }],
    brandIds: [[""], ["a", 1], "abc"],
    priceRange: [{ min: -234 }, { max: -234 }, { min: 200, max: 100 }],
    pagination: invalidPaginationValues,
  },

  search: {
    query: ["", "   ", "a".repeat(config.MAX_SEARCH_QUERY_LENGTH + 1)],
    pagination: invalidPaginationValues,
  },

  byIds: {
    ids: ["", [""], 234],
  },

  suggestion: {
    count: [config.MAX_SEARCH_SUGGESTIONS + 1, "223", 3423.23423, -3223],
    query: ["a".repeat(config.MAX_SEARCH_QUERY_LENGTH + 1), "", "   "],
  },

  similar: {
    id: [""],
    count: [config.MAX_SIMILAR_PRODUCTS + 1, 341.2342, -234],
  },
});

const validHttpRequest: HttpRequest = deepFreeze({
  body: {},
  ip: "abc",
  params: {},
  headers: {},
  method: "get",
  path: "/products",
  query: validQueryDataset.list,
});

describe("Validation", () => {
  const testData = (() => {
    const arr: any = [];

    Object.entries(invalidQueryDataSet).forEach(
      ([qType, invalidFieldsObject]) => {
        Object.entries(invalidFieldsObject).forEach(
          ([field, invalidValues]) => {
            for (const value of invalidValues)
              arr.push({
                // @ts-ignore shut up man! Life is already unbearable enough 😭
                query: { qType, ...validQueryDataset[qType], [field]: value },
                qType,
                field,
                invalidValue: value,
              });
          }
        );
      }
    );
    return arr;
  })();

  it.each(testData)(
    `qType: "$qType"; err if invalid "$field" ($invalidValue)`,
    // @ts-ignore
    async ({ query }) => {
      const response = await getProducts({
        httpRequest: { ...validHttpRequest, query },
      });

      expect(response).toEqual({
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
        body: {
          success: false,
          errorType: "validation",
          error: {
            formErrors: expect.any(Array),
            fieldErrors: expect.any(Object),
          },
        },
      });
    }
  );
});

describe("ListProducts", () => {
  const sortBy = Object.freeze({
    price: "1",
  });
  const query = deepFreeze({
    ...validQueryDataset.list,
    categoryId: undefined,
    sortBy,
  });

  it(`returns products from all categories if no categoryId is provided`, async () => {
    const fakeProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    ProductService.listProducts.mockResolvedValueOnce(fakeProducts);

    const arg = deepFreeze({ httpRequest: { ...validHttpRequest, query } });
    const response = await getProducts(arg);
    expect(response).toEqual({
      headers: { "Content-Type": "application/json" },
      statusCode: 200,
      body: { success: true, data: fakeProducts },
    });

    expect(ProductService.listProducts).toHaveBeenCalledTimes(1);

    expect(ProductService.listProducts).toHaveBeenCalledWith({
      categoryIds: [],
      brandIds: query.brandIds,
      formatDocumentAs: "public",
      pagination: query.pagination,
      priceRange: query.priceRange,
      sortBy: { price: "ascending" },
    });

    Object.values(ProductService).forEach((service) => {
      if (service !== ProductService.listProducts)
        expect(service).not.toHaveBeenCalled();
    });

    Object.values(CategoryService).forEach((service) => {
      expect(service).not.toHaveBeenCalled();
    });
  });

  it(`returns products from the given category and its subCategories`, (done) => {
    const categoryId = "parent";
    const fakeSubCategories = deepFreeze([
      { _id: "c" },
      { _id: "d" },
      { _id: "e" },
      { _id: categoryId },
    ]);
    const categoryIds = [
      ...new Set(fakeSubCategories.map((c) => c._id).concat([categoryId])),
    ];
    CategoryService.findSubCategories.mockResolvedValueOnce(fakeSubCategories);

    const fakeProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    ProductService.listProducts.mockResolvedValueOnce(fakeProducts);

    const arg = deepFreeze({
      httpRequest: { ...validHttpRequest, query: { ...query, categoryId } },
    });

    const withTransactionCallbackArg = deepFreeze({
      transaction: "a pain in the neck",
    });

    getProducts(arg).then((response) => {
      try {
        expect(response).toEqual({
          headers: { "Content-Type": "application/json" },
          statusCode: 200,
          body: { success: true, data: fakeProducts },
        });

        expect(CategoryService.findSubCategories).toHaveBeenCalledTimes(1);
        expect(ProductService.listProducts).toHaveBeenCalledTimes(1);

        expect(CategoryService.findSubCategories).toHaveBeenCalledWith(
          { id: categoryId, formatDocumentAs: "public" },
          withTransactionCallbackArg
        );

        expect(ProductService.listProducts).toHaveBeenCalledWith(
          {
            categoryIds,
            brandIds: query.brandIds,
            formatDocumentAs: "public",
            pagination: query.pagination,
            priceRange: query.priceRange,
            sortBy: { price: "ascending" },
          },
          withTransactionCallbackArg
        );

        Object.values(ProductService).forEach((service) => {
          if (service !== ProductService.listProducts)
            expect(service).not.toHaveBeenCalled();
        });

        Object.values(CategoryService).forEach((service) => {
          if (service !== CategoryService.findSubCategories)
            expect(service).not.toHaveBeenCalled();
        });

        done();
      } catch (ex) {
        done(ex);
      }
    });

    const transactionCallback = WithTransaction.mock.calls[0][0];
    transactionCallback(withTransactionCallbackArg);
  });
});

describe("findProductByIds", () => {
  it(`returns the products with the given ids`, async () => {
    const fakeProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    ProductService.findProductByIds.mockResolvedValueOnce(fakeProducts);

    const arg = deepFreeze({
      httpRequest: { ...validHttpRequest, query: validQueryDataset.byIds },
    });
    const response = await getProducts(arg);
    expect(response).toEqual({
      headers: { "Content-Type": "application/json" },
      statusCode: 200,
      body: { success: true, data: fakeProducts },
    });

    expect(ProductService.findProductByIds).toHaveBeenCalledTimes(1);
    expect(ProductService.findProductByIds).toHaveBeenCalledWith({
      ids: arg.httpRequest.query.ids,
      formatDocumentAs: "public",
    });

    Object.values(ProductService).forEach((service) => {
      if (service !== ProductService.findProductByIds)
        expect(service).not.toHaveBeenCalled();
    });

    Object.values(CategoryService).forEach((service) => {
      expect(service).not.toHaveBeenCalled();
    });
  });
});

describe("searchProducts", () => {
  it(`returns the found products`, async () => {
    const fakeProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    ProductService.searchProducts.mockResolvedValueOnce(fakeProducts);

    const arg = deepFreeze({
      httpRequest: {
        ...validHttpRequest,
        query: validQueryDataset.search,
      },
    });

    const response = await getProducts(arg);
    expect(response).toEqual({
      statusCode: 200,
      body: { success: true, data: fakeProducts },
      headers: { "Content-Type": "application/json" },
    });

    expect(ProductService.searchProducts).toHaveBeenCalledTimes(1);
    expect(ProductService.searchProducts).toHaveBeenCalledWith({
      formatDocumentAs: "public",
      query: arg.httpRequest.query.query,
      pagination: arg.httpRequest.query.pagination,
    });

    Object.values(ProductService).forEach((service) => {
      if (service !== ProductService.searchProducts)
        expect(service).not.toHaveBeenCalled();
    });

    Object.values(CategoryService).forEach((service) => {
      expect(service).not.toHaveBeenCalled();
    });
  });
});

describe("getSearchSuggestions", () => {
  it(`returns search suggestion`, async () => {
    const fakeSuggestions = deepFreeze([{ a: 1 }, { b: 1 }]);
    ProductService.getSearchSuggestions.mockResolvedValueOnce(fakeSuggestions);

    const arg = deepFreeze({
      httpRequest: {
        ...validHttpRequest,
        query: validQueryDataset.suggestions,
      },
    });
    const response = await getProducts(arg);

    expect(response).toEqual({
      statusCode: 200,
      body: { success: true, data: fakeSuggestions },
      headers: { "Content-Type": "application/json" },
    });

    expect(ProductService.getSearchSuggestions).toHaveBeenCalledTimes(1);
    expect(ProductService.getSearchSuggestions).toHaveBeenCalledWith({
      query: arg.httpRequest.query.query,
      count: arg.httpRequest.query.count,
    });

    Object.values(ProductService).forEach((service) => {
      if (service !== ProductService.getSearchSuggestions)
        expect(service).not.toHaveBeenCalled();
    });

    Object.values(CategoryService).forEach((service) => {
      expect(service).not.toHaveBeenCalled();
    });
  });
});

describe("findSimilarProducts", () => {
  it(`returns similar products for the given id`, (done) => {
    const fakeProducts = deepFreeze([{ a: 1 }, { b: 2 }]);
    ProductService.findSimilarProducts.mockResolvedValueOnce(fakeProducts);

    const arg = deepFreeze({
      httpRequest: { ...validHttpRequest, query: validQueryDataset.similar },
    });

    const withTransactionCallbackArg = deepFreeze({
      transaction: "a pain in the neck",
    });

    getProducts(arg)
      .then((response) => {
        try {
          expect(response).toEqual({
            statusCode: 200,
            body: { success: true, data: fakeProducts },
            headers: { "Content-Type": "application/json" },
          });

          expect(ProductService.findSimilarProducts).toHaveBeenCalledTimes(1);
          expect(ProductService.findSimilarProducts).toHaveBeenCalledWith(
            {
              id: arg.httpRequest.query.id,
              count: arg.httpRequest.query.count,
            },
            { transaction: withTransactionCallbackArg.transaction }
          );

          Object.values(ProductService).forEach((service) => {
            if (service !== ProductService.findSimilarProducts)
              expect(service).not.toHaveBeenCalled();
          });

          Object.values(CategoryService).forEach((service) => {
            expect(service).not.toHaveBeenCalled();
          });

          done();
        } catch (ex) {
          done(ex);
        }
      })
      .catch(done);

    const transactionCallback = WithTransaction.mock.calls[0][0];
    transactionCallback(withTransactionCallbackArg);
  });
});

describe("ErrorHandling", () => {
  it.each([
    { qType: "list", serviceName: "listProducts" },
    { qType: "search", serviceName: "searchProducts" },
    { qType: "byIds", serviceName: "findProductByIds" },
    { qType: "suggestions", serviceName: "getSearchSuggestions" },
  ] as const)(
    `qType: "$qType"; returns error if service "$serviceName" throws error`,
    async ({ qType, serviceName }) => {
      ProductService[serviceName].mockRejectedValueOnce(
        new Error("you're boned!")
      );
      const arg = deepFreeze({
        httpRequest: { ...validHttpRequest, query: validQueryDataset[qType] },
      });

      const response = await getProducts(arg);
      expect(response).toEqual({
        statusCode: 500,
        body: {
          success: false,
          errorType: "msgAndCode",
          error: { message: expect.any(String) },
        },
        headers: { "Content-Type": "application/json" },
      });
    }
  );
});
