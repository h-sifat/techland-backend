import type { Express as ExpressServer } from "express";

import cors from "cors";
import helmet from "helmet";
import express from "express";
import compression from "compression";
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

  server.use(cors());

  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["*", "data:"],
          connectSrc: ["'self'", "*"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["*", "'self'", "'unsafe-inline'"],
          frameSrc: ["'self'", "*"],
        },
      },
    })
  );
  server.use(compression());

  server.use(express.json());
  server.use(express.query({ strictNullHandling: true }));
  server.use(`/${apiRoot}`, urlEncodedBase64QueryStringParser);

  server.disable("x-powered-by");

  return server;
}
