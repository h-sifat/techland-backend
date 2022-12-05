import {
  getConfig,
  PRODUCT_SEARCH_FIELDS,
  DEFAULT_DB_TRANSACTION_OPTIONS,
  PRODUCT_GET_CONTROLLER_DEFAULT_CONFIG,
} from "../config";

import { makeProductService } from "../use-cases/product";
import { makeProductDatabase } from "../data-access/product";
import { makeProductController } from "../controllers/product";
import { makeProductCategoryService } from "../use-cases/product-category";
import { makeDatabaseClient, makeWithTransaction } from "../data-access/util";
import { makeProductCategoryDatabase } from "../data-access/product-category";
import { makeProductCategoryController } from "../controllers/product-category";

export async function makeControllers() {
  const config = getConfig();

  const databaseClient = await makeDatabaseClient({
    host: config.DB_HOST,
    protocol: config.DB_PROTOCOL,
    auth: { username: config.DB_USERNAME, password: config.DB_PASSWORD },
  });

  const WithTransaction = makeWithTransaction({
    client: databaseClient,
    transactionOptions: DEFAULT_DB_TRANSACTION_OPTIONS,
  });

  const productCollection = databaseClient
    .db(config.DB_NAME)
    .collection(config.PRODUCTS_COL_NAME);

  const productCategoriesCollection = databaseClient
    .db(config.DB_NAME)
    .collection(config.PRODUCT_CATEGORIES_COL_NAME);

  const ProductDatabase = makeProductDatabase({
    collection: productCollection as any,
    imageUrlPrefix: config.IMAGE_URL_PREFIX,
    productSearchFields: PRODUCT_SEARCH_FIELDS as any,
    productCategoryCollectionName: config.PRODUCT_CATEGORIES_COL_NAME,
  });

  const ProductCategoryDatabase = makeProductCategoryDatabase({
    imageUrlPrefix: config.IMAGE_URL_PREFIX,
    collection: productCategoriesCollection as any,
    collectionName: config.PRODUCT_CATEGORIES_COL_NAME,
  });

  const ProductService = makeProductService({ database: ProductDatabase });
  const ProductCategoryService = makeProductCategoryService({
    database: ProductCategoryDatabase,
  });

  const ProductController = makeProductController({
    ProductService,
    WithTransaction,
    CategoryService: ProductCategoryService,
    config: {
      ...PRODUCT_GET_CONTROLLER_DEFAULT_CONFIG,
      MAX_FIND_BY_IDS: config.MAX_FIND_BY_IDS,
      MAX_SIMILAR_PRODUCTS: config.MAX_SIMILAR_PRODUCTS,
      MAX_PRODUCTS_PER_PAGE: config.MAX_PRODUCTS_PER_PAGE,
      MAX_SEARCH_SUGGESTIONS: config.MAX_SEARCH_SUGGESTIONS,
      MAX_SEARCH_QUERY_LENGTH: config.MAX_SEARCH_QUERY_LENGTH,
    },
  });

  const ProductCategoryController = makeProductCategoryController({
    CategoryService: ProductCategoryService,
  });

  return Object.freeze({ ProductController, ProductCategoryController });
}
