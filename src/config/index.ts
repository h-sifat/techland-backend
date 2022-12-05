import type { EmployeeConfig } from "../entities/employee/interface";
import type { UserConfigInterface } from "../entities/user/interface";
import type { AddressConfigInterface } from "../entities/address/interface";

import { deepFreeze } from "../common/util/deep-freeze";

interface EntityConfig {
  employee: EmployeeConfig;
  user: UserConfigInterface;
  address: AddressConfigInterface;
}

interface Config {
  BCRYPT_SALT_ROUNDS: number;

  // Database
  DB_HOST: string;
  DB_NAME: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_PROTOCOL: string;
  IMAGE_URL_PREFIX: string;
  PRODUCTS_COL_NAME: string;
  PRODUCT_CATEGORIES_COL_NAME: string;

  MAX_FIND_BY_IDS: number;
  MAX_SIMILAR_PRODUCTS: number;
  MAX_PRODUCTS_PER_PAGE: number;
  MAX_SEARCH_SUGGESTIONS: number;
  MAX_SEARCH_QUERY_LENGTH: number;

  API_ROOT: string;
}

const config: Config = {
  BCRYPT_SALT_ROUNDS: 10,

  DB_NAME: "",
  DB_HOST: "",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  DB_PROTOCOL: "",

  IMAGE_URL_PREFIX: "",
  PRODUCTS_COL_NAME: "",
  PRODUCT_CATEGORIES_COL_NAME: "",

  MAX_FIND_BY_IDS: 50,
  MAX_SIMILAR_PRODUCTS: 20,
  MAX_PRODUCTS_PER_PAGE: 80,
  MAX_SEARCH_SUGGESTIONS: 10,
  MAX_SEARCH_QUERY_LENGTH: 150,

  API_ROOT: "api-v1-0-0",
};

export function getConfig(): Readonly<Config> {
  return Object.freeze({ ...config });
}

const entityConfig: EntityConfig = {
  address: {
    phoneLength: 15,
    zipCodeLength: 4,
    maxCityLength: 50,
    maxStreetLength: 50,
    maxDistrictLength: 50,
  },
  user: {
    MAX_NAME_LENGTH: 30,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 32,
  },
  employee: {
    MAX_NAME_LENGTH: 30,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 32,
  },
};

export function getEntityConfig<entity extends keyof EntityConfig>(arg: {
  entity: entity;
}): EntityConfig[entity] {
  const { entity } = arg;

  return Object.freeze({
    ...entityConfig[entity],
  }) as unknown as EntityConfig[entity];
}

export const DEFAULT_DB_TRANSACTION_OPTIONS = deepFreeze({
  readPreference: "primary",
  writeConcern: { w: "majority" },
  readConcern: { level: "majority" },
} as const);

export const PRODUCT_SEARCH_FIELDS = Object.freeze([
  "name",
  "brand.name",
  "description",
  "shortDescriptions",
]);

export const PRODUCT_GET_CONTROLLER_DEFAULT_CONFIG = Object.freeze({
  DEFAULT_PRODUCTS_PER_PAGE: 20,
  DEFAULT_SIMILAR_PRODUCTS_COUNT: 5,
  DEFAULT_SEARCH_SUGGESTIONS_COUNT: 5,
});

export const DEFAULT_DB_OPTIONS = Object.freeze({
  w: "majority",
  readConcernLevel: "majority",
} as const);
