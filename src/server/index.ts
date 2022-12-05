import type { Express as ExpressServer } from "express";

import express from "express";
import { makeExpressQueryParserMiddleware, parseQuery } from "./util";

export interface MakeServer_Argument {
  apiRoot: string;
  queryFieldName: string;
}
export function makeServer(factoryArg: MakeServer_Argument): ExpressServer {
  const { queryFieldName, apiRoot } = factoryArg;

  const urlEncodedBase64QueryStringParser = makeExpressQueryParserMiddleware({
    parseQuery,
    queryFieldName,
    errorBody: {
      success: false,
      errorType: "msgAndCode",
      error: { message: `Invalid query string.` },
    },
  });

  const server = express();

  server.use(express.json());
  server.use(express.query({ strictNullHandling: true }));
  server.use(`/${apiRoot}`, urlEncodedBase64QueryStringParser);

  return server;
}
