import type {
  HttpRequest,
  HttpResponse,
  ControllerMethod,
} from "../controllers/interface";
import type { RequestHandler } from "express";

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

export interface MakeExpressRequestHandler_Argument {
  debug?: (v: any) => void;
  controller: ControllerMethod;
}
export function makeExpressRequestHandler(
  factoryArg: MakeExpressRequestHandler_Argument
): RequestHandler {
  const { controller, debug = () => {} } = factoryArg;

  return async (req, res) => {
    const httpRequest: HttpRequest = {
      ip: req.ip,
      body: req.body,
      path: req.path,
      query: req.query,
      params: req.params,
      method: <any>req.method,
      headers: {
        Referer: req.get("referer"),
        "User-Agent": req.get("User-Agent"),
        "Content-Type": req.get("Content-Type"),
      },
    };

    try {
      const httpResponse = await controller({ httpRequest });
      res.set(httpResponse.headers);
      res.status(httpResponse.statusCode);
      res.json(httpResponse.body);
    } catch (ex) {
      debug(ex);

      res.status(500);
      res.json({
        success: false,
        errorType: "msgAndCode",
        error: { message: "Internal server error." },
      });
    }
  };
}
