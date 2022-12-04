import type { HttpRequest } from "../interface";
import { makeGetCategories } from "./get-categories";

const CategoryService = Object.freeze({
  listCategories: jest.fn(),
  findCategoryById: jest.fn(),
  findSubCategories: jest.fn(),
});

const getCategories = makeGetCategories({ CategoryService });

beforeEach(() => {
  Object.values(CategoryService).forEach((service) => service.mockReset());
});

const validHttpRequest: HttpRequest = {
  ip: "",
  query: {},
  params: {},
  headers: {},
  method: "get",
  body: undefined,
  path: "/categories",
};

describe("Validation", () => {
  it.each([
    {},
    { lookup: "All" },
    { lookup: "sub" },
    { lookup: "self" },
    { lookup: "self", id: "" },
    { lookup: "sub", id: "" },
  ])(`throws error if query is invalid (%p)`, async (query) => {
    const response = await getCategories({
      // @ts-ignore
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
  });
});

describe("Functionality", () => {
  {
    const statusCode = 500;
    it(`returns a response with statusCode: ${statusCode} is data fetching fails`, async () => {
      CategoryService.listCategories.mockRejectedValueOnce(
        new Error("db error")
      );

      const query = { lookup: "all" } as any;
      const response = await getCategories({
        httpRequest: { ...validHttpRequest, query },
      });

      expect(response).toEqual({
        headers: { "Content-Type": "application/json" },
        statusCode: 500,
        body: {
          success: false,
          errorType: "msgAndCode",
          error: { message: expect.any(String) },
        },
      });
    });
  }

  it.each([
    {
      query: { lookup: "all" },
      respectiveServiceName: "listCategories",
    },
    {
      query: { lookup: "sub", id: "abc" },
      respectiveServiceName: "findSubCategories",
    },
    {
      query: { lookup: "self", id: "abc" },
      respectiveServiceName: "findCategoryById",
    },
  ] as const)(
    `call the "$respectiveServiceName" service for lookup value: "$query.lookup"`,
    async ({ query, respectiveServiceName }) => {
      const fakeResponse = { value: Math.random() };
      CategoryService[respectiveServiceName].mockResolvedValueOnce(
        fakeResponse
      );

      const response = await getCategories({
        // @ts-ignore
        httpRequest: { ...validHttpRequest, query },
      });
      expect(response).toEqual({
        headers: { "Content-Type": "application/json" },
        statusCode: 200,
        body: {
          success: true,
          data: fakeResponse,
        },
      });
    }
  );
});
