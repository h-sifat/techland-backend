import dotenv from "dotenv";
dotenv.config();

const variables = Object.freeze([
  "PORT",
  "DB_NAME",
  "DB_HOST",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_PROTOCOL",
  "IMAGE_URL_PREFIX",
  "PRODUCTS_COL_NAME",
  "PRODUCT_CATEGORIES_COL_NAME",
  "IMAGES_DIRECTORY",
  "FILES_DIRECTORY",
] as const);

const changes = variables.reduce((changes, variable) => {
  changes[variable] = process.env[variable]!;
  return changes;
}, {} as Record<string, string>);

import { modifyConfig } from "./config";
modifyConfig({ changes });
