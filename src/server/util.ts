import type { RequestHandler } from "express";
import { HttpResponse } from "../controllers/interface";

type ParseQuery = (arg: { query: string }) => object;

/**
 * Parses urlEncoded base64 json string.
 */
export const parseQuery: ParseQuery = function _parseQuery(arg): object {
  const { query } = arg;

  const jsonQuery = Buffer.from(decodeURIComponent(query), "base64").toString(
    "utf8"
  );

  return JSON.parse(jsonQuery);
};

export interface MakeExpressQueryParserMiddleware_Argument {
  parseQuery: ParseQuery;
  queryFieldName: string;
  errorBody: HttpResponse["body"];
}

/**
 * Parses the `req.query[queryFieldName]` field then assigns
 * the parsed object to `req.query` and calls `next()`
 * */
export function makeExpressQueryParserMiddleware(
  factoryArg: MakeExpressQueryParserMiddleware_Argument
): RequestHandler {
  const { parseQuery, queryFieldName, errorBody } = factoryArg;

  return (req, res, next) => {
    const sendErrorResponse = () => {
      res.status(400);
      res.json(errorBody);
    };

    if (!(queryFieldName in req.query)) return sendErrorResponse();

    try {
      const query = String(req.query[queryFieldName]);
      const queryObject = parseQuery({ query });

      if (Array.isArray(queryObject)) return sendErrorResponse();

      req.query = queryObject as any;
      next();
    } catch (ex) {
      sendErrorResponse();
    }
  };
}
