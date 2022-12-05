import { deepFreeze } from "../common/util/deep-freeze";
import { makeExpressQueryParserMiddleware, parseQuery } from "./util";

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
