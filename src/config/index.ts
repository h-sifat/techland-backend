import type { AddressConfigInterface } from "../entities/address/interface";

interface EntityConfig {
  address: AddressConfigInterface;
}

interface Config {
  BCRYPT_SALT_ROUNDS: number;
}

const config: Config = {
  BCRYPT_SALT_ROUNDS: 10,
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
};

export function getEntityConfig<entity extends keyof EntityConfig>(arg: {
  entity: entity;
}): EntityConfig[entity] {
  const { entity } = arg;

  return Object.freeze({
    ...entityConfig[entity],
  }) as unknown as EntityConfig[entity];
}
