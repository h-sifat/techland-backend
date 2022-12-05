import {
  parseQuery,
  makeExpressRequestHandler,
  makeExpressQueryParserMiddleware,
} from "./util";
import { pick } from "lodash";
import { deepFreeze } from "../common/util/deep-freeze";
import type { HttpResponse } from "../controllers/interface";

describe("parseQuery", () => {
  it(`parses a base64 encoded json object`, () => {
    const object = deepFreeze({
      a: 1,
      b: [2, { c: 3 }, "hi"],
    });

    const query = encodeURIComponent(
      Buffer.from(JSON.stringify(object), "utf8").toString("base64")
    );

    const parsedQueryObject = parseQuery({ query });
    expect(parsedQueryObject).toEqual(object);
  });
});

describe("makeExpressQueryParserMiddleware", () => {
  const errorBody = deepFreeze({
    success: false,
    errorType: "msgAndCode",
    error: { message: "Invalid query" },
  } as const);
  const queryFieldName = "q";

  const parseQuery = jest.fn();
  const res = Object.freeze({
    status: jest.fn(),
    json: jest.fn(),
  });
  const next = jest.fn();

  beforeEach(() => {
    parseQuery.mockReset();
    next.mockReset(),
      Object.values(res).forEach((method) => method.mockReset());
  });

  const expressQueryParserMiddleware = makeExpressQueryParserMiddleware({
    errorBody,
    parseQuery,
    queryFieldName,
  });

  it.each([
    {
      req: { query: {} },
      case: "missing queryFieldName in query object",
      beforeTest: () => {},
    },
    {
      req: { query: { [queryFieldName]: "abc" } },
      case: "the parsed query is an array",
      beforeTest: () => {
        parseQuery.mockReturnValue([]);
      },
    },

    {
      req: { query: { [queryFieldName]: "abc" } },
      case: "the parseQuery function throws error",
      beforeTest: () => {
        parseQuery.mockImplementationOnce(() => {
          throw new Error("Invalid query");
        });
      },
    },
  ])(`sends error response if $case`, ({ req, beforeTest }) => {
    beforeTest();

    expressQueryParserMiddleware(<any>req, <any>res, next);

    if (queryFieldName in req.query)
      expect(parseQuery).toHaveBeenCalledWith({
        query: req.query[queryFieldName],
      });

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(errorBody);
  });

  it(`assigns the queryObject to req.query and calls next`, () => {
    const fakeParsedQueryObject = deepFreeze({ a: 1, b: { c: 3 } });
    parseQuery.mockReturnValueOnce(fakeParsedQueryObject);

    const query = deepFreeze({ [queryFieldName]: "abc" });
    const req = { query };

    expressQueryParserMiddleware(<any>req, <any>res, next);

    expect(parseQuery).toHaveBeenCalledWith({ query: query[queryFieldName] });
    expect(req.query).toEqual(fakeParsedQueryObject);

    expect(next).toHaveBeenCalledTimes(1);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("makeExpressRequestHandler", () => {
  const controller = jest.fn();
  const next = jest.fn();
  const debug = jest.fn();
  const res = Object.freeze({
    set: jest.fn(),
    json: jest.fn(),
    status: jest.fn(),
  });
  const req = Object.freeze({
    ip: "a",
    params: {},
    method: "get",
    set: jest.fn(),
    get: jest.fn(),
    query: { a: 1 },
    path: "/products",
    body: { name: "a" },
  });

  beforeEach(() => {
    [debug, next, req.get, req.set, controller].forEach((method: any) =>
      method.mockReset()
    );
    Object.values(res).forEach((method) => method.mockReset());

    // return random header value
    req.get.mockImplementation(() => Math.random().toString());
  });

  const requestHandler = makeExpressRequestHandler({ controller, debug });

  it(`sends the httpResponse from the controller`, async () => {
    const fakeControllerResponse: HttpResponse = deepFreeze({
      statusCode: 200,
      body: { success: true, data: { a: 1 } },
      headers: { "Content-Type": "application/json" },
    });
    controller.mockResolvedValueOnce(fakeControllerResponse);

    await requestHandler(<any>req, <any>res, next);

    expect(controller).toHaveBeenCalledWith({
      httpRequest: {
        ...pick(req, ["ip", "body", "path", "query", "params", "method"]),
        headers: {
          Referer: expect.any(String),
          "User-Agent": expect.any(String),
          "Content-Type": expect.any(String),
        },
      },
    });

    [next, debug].forEach((method: any) => {
      expect(method).not.toHaveBeenCalled();
    });

    [res.set, res.status, res.json].forEach((method) => {
      expect(method).toHaveBeenCalledTimes(1);
    });

    // to get the headers
    expect(req.get).toHaveBeenCalledTimes(3);

    expect(res.set).toHaveBeenCalledWith(fakeControllerResponse.headers);
    expect(res.json).toHaveBeenCalledWith(fakeControllerResponse.body);
    expect(res.status).toHaveBeenCalledWith(fakeControllerResponse.statusCode);
  });

  it(`sends error response if controller throws an error`, async () => {
    const error = new Error("couldn't connect to db");
    controller.mockRejectedValueOnce(error);

    await requestHandler(<any>req, <any>res, next);

    [next, res.set].forEach((method: any) => {
      expect(method).not.toHaveBeenCalled();
    });

    [res.status, res.json, debug].forEach((method) => {
      expect(method).toHaveBeenCalledTimes(1);
    });

    expect(debug).toHaveBeenCalledWith(error);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errorType: "msgAndCode",
      error: { message: expect.any(String) },
    });
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
