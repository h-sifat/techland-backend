import "./set-env"; // @WARNING this line must be at the top

import path from "path";
import express from "express";
import { getConfig } from "./config";
import { makeServer } from "./server";
import { makeControllers } from "./controllers";
import { makeDebugger } from "./common/util/debug";
import { makeExpressRequestHandler } from "./server/util";

const config = getConfig();

const server = makeServer({
  apiRoot: config.API_ROOT,
  queryFieldName: config.QUERY_FIELD_NAME,
});

async function initApplication() {
  const debug = makeDebugger({ namespace: "request-handler" });
  const controllers = await makeControllers();

  server.use("/images", express.static(config.IMAGES_DIRECTORY));
  server.use(express.static(config.FILES_DIRECTORY));

  server.get(
    `/${config.API_ROOT}/products`,
    makeExpressRequestHandler({
      debug,
      controller: controllers.ProductController.get,
    })
  );

  server.get(
    `/${config.API_ROOT}/categories`,
    makeExpressRequestHandler({
      debug,
      controller: controllers.ProductCategoryController.get,
    })
  );

  server.use((_, res) => {
    // if an unknown route is found then redirect to the home page.
    // The frontend will take care of showing a "Not Found" error.
    res.sendFile(path.join(config.FILES_DIRECTORY, "index.html"));
  });

  server.listen(config.PORT, () => {
    console.log(`Server running on port: ${config.PORT}`);
  });
}

initApplication();
